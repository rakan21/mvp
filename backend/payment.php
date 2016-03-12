<?php
require_once __DIR__.'/lib/Stripe.php';
require_once __DIR__.'/config.loader.php';

Stripe::setApiKey($config['stripe_sk']);

if (isset($_POST['token'])) {
    $token       = $_POST['token'];
    $amount      = $_POST['amount'];
    $description = $_POST['description'];
    $email       = $_POST['email'];

    $hash_mail = hash('sha512', $email, $config['salt']);

    $db = new PDO('mysql:host='.$config['db_url'].';dbname='.$config['db_name'], $config['db_user'], $config['db_password']);

    // Try to connect to database and find a customer
    try {
        $query = $db->prepare("SELECT id FROM customers WHERE email=:email");
        $query->bindParam('email', $hash_mail);
        $customer = $query->fetch();
        $customer_id = $customer['id'];
    } catch(PDOException $e) {
        error_log($e);
        echo 'database error';
    }

    // Create a new customer on Stripe and on database
    if ( !isset($customer_id) ) {
        try {
            $customer = Stripe_Customer::create(array(
                'source' => $token,
                'email' => $email
            ));
        } catch(Stripe_Error $e) {
            error_log($e);
            echo 'error';
        }

        try {
            $query = $db->prepare("INSERT INTO customers (email, id) VALUES (:email, :id)");
            $rows = $query->execute(array(
                'email' => $hash_mail,
                'id'    => $customer['id']
            ));
        } catch(PDOException $e) {
            error_log($e);
            echo 'database error';
        }

        $customer_id = $customer['id'];
    }

    // Create the charge on Stripe's servers - this will charge the user's card
    try {
        $ticket = array(
            'amount' => $amount,
            'currency' => 'usd',
            'description' => $description,
            'receipt_email' => $email,
        );

        // Oh god, fall back to known variables
        if ( isset($customer_id) ) {
            $ticket['customer'] = $customer_id;
        } else {
            $ticket['source'] = $token;
        }

        $charge = Stripe_Charge::create($ticket);

        // Set an insecure, HTTP only cookie for 10 years in the future.
        $encoded = urlencode(str_replace(' ', '_', 'has_paid_'.$description));
        //setcookie($encoded, $amount, time() + 315360000, '/', '', 0, 1);

        echo 'OK';
    } catch(Stripe_CardError $e) {
        echo 'error';
    }
} else {
    echo $config['stripe_pk'];
}

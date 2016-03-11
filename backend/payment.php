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

    // Find customer_id from hash_mail in our database
    // $query = 'SELECT `customer_id` FROM `Customers` WHERE `email` = `'.$hash_mail.'`';
    // $result = $db->query($query)
    $customer_id = false;

    // Create a new customer on Stripe's servers
    if ( !$customer_id ) {
        try {
            $customer = Stripe_Customer::create(array(
                'source' => $token,
                'email' => $email
            ));
            $customer_id = $customer['id'];
        } catch(Stripe_Error $e) {
            echo 'error';
        }
    }

    // Create the charge on Stripe's servers - this will charge the user's card
    try {
        $charge = Stripe_Charge::create(array(
            'amount' => $amount,
            'currency' => 'usd',
            'customer' => $customer_id,
            'description' => $description,
            'receipt_email' => $email,
        ));
        // Set an insecure, HTTP only cookie for 10 years in the future.
        $encoded = urlencode(str_replace(' ', '_', 'has_paid_'.$description));
        setcookie($encoded, $amount, time() + 315360000, '/', '', 0, 1);
        echo 'OK';
    } catch(Stripe_CardError $e) {
        echo 'error';
    }
} else {
    echo $config['stripe_pk'];
}

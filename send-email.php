<?php
header('Content-Type: application/json; charset=UTF-8');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Проверка дали заявката е POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Получаване на данните от формата
  $name = strip_tags(trim($_POST["name"]));
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $phone = strip_tags(trim($_POST["phone"]));
  $company = strip_tags(trim($_POST["company"]));
  $service = strip_tags(trim($_POST["service"]));
  $message = strip_tags(trim($_POST["message"]));
  
  // Валидация
  if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      echo json_encode(array("success" => false, "message" => "Моля попълнете всички задължителни полета с валидни данни."));
      exit;
  }
  
  // Валидация на телефонен номер, ако е въведен
  if (!empty($phone)) {
    $digitsOnly = preg_replace('/\D/', '', $phone);
    
    // Проверка дали има между 7 и 15 цифри
    if (strlen($digitsOnly) < 7 || strlen($digitsOnly) > 15) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Моля въведете валиден телефонен номер (7-15 цифри)."));
        exit;
    }
  }
  
  $recipient = "info@vhodnistelki.bg";
  $subject = "Ново съобщение от сайта - Входни Стелки";
  
  // Replace "yourdomain.com" with your actual domain
  $domain = $_SERVER['HTTP_HOST'];
  $from_email = "noreply@" . $domain;
  
  // Съдържание на имейла
  $email_content = "Получихте ново съобщение от контактната форма:\n\n";
  $email_content .= "Име: $name\n";
  $email_content .= "Email: $email\n";
  
  if (!empty($phone)) {
      $email_content .= "Телефон: $phone\n";
  }
  
  if (!empty($company)) {
      $email_content .= "Компания: $company\n";
  }
  
  if (!empty($service)) {
      $service_names = array(
          "residential-premium" => "Пакет ЖИЛИЩЕН ВХОД Премиум",
          "residential-standard" => "Пакет ЖИЛИЩЕН ВХОД Стандарт",
          "small-office-premium" => "Пакет МАЛЪК ОФИС Премиум",
          "small-office-standard" => "Пакет МАЛЪК ОФИС Стандарт",
          "commercial-premium" => "Пакет ТЪРГОВСКИ ОБЕКТ Премиум",
          "commercial-standard" => "Пакет ТЪРГОВСКИ ОБЕКТ Стандарт",
          "consultation" => "Консултация"
      );
      $service_name = isset($service_names[$service]) ? $service_names[$service] : $service;
      $email_content .= "Интересува се от: $service_name\n";
  }
  
  $email_content .= "\nСъобщение:\n$message\n";
  $email_content .= "\n---\n";
  $email_content .= "Това съобщение е изпратено от контактната форма на вашия сайт.\n";
  
  $email_headers = "From: Входни Стелки <$from_email>\r\n";
  $email_headers .= "Reply-To: $email\r\n";
  $email_headers .= "Return-Path: $from_email\r\n";
  $email_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
  $email_headers .= "X-Priority: 3\r\n";
  $email_headers .= "MIME-Version: 1.0\r\n";
  $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $email_headers .= "Content-Transfer-Encoding: 8bit\r\n";
  
  error_log("Attempting to send email to: $recipient");
  error_log("From: $from_email");
  error_log("Subject: $subject");
  
  // Изпращане на имейла
  $mail_sent = @mail($recipient, $subject, $email_content, $email_headers);
  
  if ($mail_sent) {
      error_log("Email sent successfully");
      http_response_code(200);
      echo json_encode(array("success" => true, "message" => "Съобщението е изпратено успешно! Ще се свържем с вас скоро."));
  } else {
      $error = error_get_last();
      error_log("Email failed to send. Error: " . print_r($error, true));
      
      http_response_code(500);
      echo json_encode(array(
          "success" => false, 
          "message" => "Възникна грешка при изпращането. Моля опитайте отново или се свържете директно на телефон.",
          "debug" => "Check php_errors.log for details"
      ));
  }
} else {
  http_response_code(403);
  echo json_encode(array("success" => false, "message" => "Неразрешен достъп."));
}
?>

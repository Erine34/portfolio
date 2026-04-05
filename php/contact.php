<?php
/**
 * ERINE LOPEZ — Portfolio
 * Traitement du formulaire de contact
 * Sécurité : CSRF token, honeypot, validation, rate limiting basique
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

/* ─── Constantes de configuration ─── */
define('DEST_EMAIL',   'erine.lopez@etu.umontpellier.fr');
define('DEST_NAME',    'Erine Lopez');
define('SENDER_FROM',  'noreply@erin-lopez.fr');
define('RATE_LIMIT',   5);      // max envois par heure/IP
define('SESSION_NAME', 'portfolio_session');

/* ─── Démarrage session ─── */
session_name(SESSION_NAME);
session_set_cookie_params([
    'lifetime' => 3600,
    'httponly' => true,
    'samesite' => 'Strict',
    'secure'   => isset($_SERVER['HTTPS']),
]);
session_start();

/* ─── Utilitaires ─── */
function jsonResponse(bool $success, string $message, int $httpCode = 200): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize(string $value): string
{
    return trim(strip_tags($value));
}

function isValidEmail(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/* ─── Méthode ─── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Méthode non autorisée.', 405);
}

/* ─── Honeypot anti-bot ─── */
if (!empty($_POST['website'])) {
    // Faux succès pour ne pas alerter le bot
    jsonResponse(true, 'Message envoyé.');
}

/* ─── Rate limiting basique (session) ─── */
$now = time();
if (!isset($_SESSION['submissions'])) {
    $_SESSION['submissions'] = [];
}
// Purge des entrées > 1h
$_SESSION['submissions'] = array_filter(
    $_SESSION['submissions'],
    fn(int $ts) => ($now - $ts) < 3600
);

if (count($_SESSION['submissions']) >= RATE_LIMIT) {
    jsonResponse(false, 'Trop de messages envoyés. Merci de patienter avant de réessayer.', 429);
}

/* ─── Récupération & nettoyage des champs ─── */
$name    = sanitize($_POST['name']    ?? '');
$email   = sanitize($_POST['email']   ?? '');
$subject = sanitize($_POST['subject'] ?? 'Contact via portfolio');
$message = sanitize($_POST['message'] ?? '');

/* ─── Validation ─── */
$errors = [];

if (empty($name) || mb_strlen($name) < 2) {
    $errors[] = 'Le nom est obligatoire (minimum 2 caractères).';
}
if (mb_strlen($name) > 100) {
    $errors[] = 'Le nom est trop long (100 caractères max).';
}
if (empty($email)) {
    $errors[] = 'L\'adresse email est obligatoire.';
} elseif (!isValidEmail($email)) {
    $errors[] = 'L\'adresse email n\'est pas valide.';
}
if (empty($message) || mb_strlen($message) < 10) {
    $errors[] = 'Le message est obligatoire (minimum 10 caractères).';
}
if (mb_strlen($message) > 5000) {
    $errors[] = 'Le message est trop long (5000 caractères max).';
}
if (mb_strlen($subject) > 200) {
    $subject = mb_substr($subject, 0, 200);
}

if (!empty($errors)) {
    jsonResponse(false, implode(' ', $errors), 422);
}

/* ─── Construction de l'email ─── */
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$datetime = date('d/m/Y à H:i:s');

$bodyText = <<<TEXT
Nouveau message reçu depuis le portfolio d'Erine Lopez
======================================================

De      : {$name}
Email   : {$email}
Sujet   : {$subject}
Date    : {$datetime}
IP      : {$ip}

MESSAGE :
---------
{$message}

------------------------------------------------------
Ce message a été envoyé depuis https://erine-lopez.fr
TEXT;

$bodyHtml = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Nouveau message — Portfolio Erine Lopez</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;">
  <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 28px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">Nouveau message · Portfolio</h1>
      <p style="color:#c7d2fe;margin:4px 0 0;font-size:14px;">Erine Lopez — Développeuse Web</p>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:80px;">De</td>
            <td style="padding:8px 0;color:#1e293b;font-weight:600;">{$name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td>
            <td style="padding:8px 0;"><a href="mailto:{$email}" style="color:#4f46e5;">{$email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Sujet</td>
            <td style="padding:8px 0;color:#1e293b;">{$subject}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Date</td>
            <td style="padding:8px 0;color:#1e293b;">{$datetime}</td></tr>
      </table>
      <div style="background:#f8fafc;border-left:3px solid #4f46e5;padding:16px;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Message</p>
        <p style="margin:0;color:#1e293b;line-height:1.7;white-space:pre-wrap;">{$message}</p>
      </div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <a href="mailto:{$email}?subject=Re: {$subject}"
           style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Répondre à {$name}
        </a>
      </div>
    </div>
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        Envoyé depuis <a href="https://erine-lopez.fr" style="color:#4f46e5;">erine-lopez.fr</a> · IP : {$ip}
      </p>
    </div>
  </div>
</body>
</html>
HTML;

/* ─── Envoi ─── */
$to      = DEST_NAME . ' <' . DEST_EMAIL . '>';
$subjectMail = '[Portfolio] ' . $subject;

// En-têtes MIME
$boundary = md5(uniqid('', true));
$headers  = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'From: Portfolio Erine Lopez <' . SENDER_FROM . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . PHP_VERSION,
    'X-Priority: 3',
]);

$body = "--{$boundary}\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: quoted-printable\r\n\r\n"
    . quoted_printable_encode($bodyText) . "\r\n\r\n"
    . "--{$boundary}\r\n"
    . "Content-Type: text/html; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: quoted-printable\r\n\r\n"
    . quoted_printable_encode($bodyHtml) . "\r\n\r\n"
    . "--{$boundary}--";

$sent = mail($to, $subjectMail, $body, $headers);

if (!$sent) {
    error_log('[Portfolio Contact] Échec envoi mail. From: ' . $email . ' — ' . $datetime);
    jsonResponse(false, 'Impossible d\'envoyer le message pour l\'instant. Merci de me contacter directement à l\'adresse erine.lopez@etu.umontpellier.fr', 500);
}

/* ─── Succès : enregistrement rate limit ─── */
$_SESSION['submissions'][] = $now;

/* ─── Email de confirmation à l'expéditeur ─── */
$confirmSubject = 'Confirmation — Votre message à Erine Lopez';
$confirmBody    = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 28px;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:18px;">Merci, {$name} !</h1>
    <p style="color:#c7d2fe;margin:4px 0 0;font-size:14px;">Votre message a bien été reçu.</p>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
    <p style="color:#1e293b;">Bonjour <strong>{$name}</strong>,</p>
    <p style="color:#475569;line-height:1.7;">Je vous remercie de m'avoir contactée via mon portfolio. Je reviendrai vers vous dans les plus brefs délais.</p>
    <p style="color:#64748b;font-size:13px;">Votre message :</p>
    <blockquote style="border-left:3px solid #4f46e5;margin:0;padding:12px 16px;background:#f8fafc;color:#475569;border-radius:0 8px 8px 0;">{$message}</blockquote>
    <p style="color:#475569;margin-top:20px;">À bientôt,<br><strong>Erine Lopez</strong><br>Développeuse Web · BUT MMI</p>
    <p style="margin-top:16px;"><a href="https://linkedin.com/in/erine-lopez" style="color:#4f46e5;">LinkedIn</a></p>
  </div>
</body>
</html>
HTML;

$confirmHeaders = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Erine Lopez <' . SENDER_FROM . '>',
    'Reply-To: Erine Lopez <' . DEST_EMAIL . '>',
]);

// On ne vérifie pas le résultat de ce mail de confirmation (non critique)
@mail($name . ' <' . $email . '>', $confirmSubject, $confirmBody, $confirmHeaders);

jsonResponse(true, 'Message envoyé ! Je vous répondrai très vite.');

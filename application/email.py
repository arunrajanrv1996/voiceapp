import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

SMTP_SERVER_HOST = "smtp.gmail.com"  # Update to Gmail's SMTP server
SMTP_SERVER_PORT = 587
SENDER_ADDRESS = 'rajanarun017@gmail.com'
SENDER_APP_PASSWORD = 'kgcu duvp ldmc yeiq'  # Update with your App Password

def send_email_user(to, sub, message, file=None):
    msg = MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To'] = to
    msg['Subject'] = sub

    msg.attach(MIMEText(message, "html"))

    if not file == None:
        with open(file, 'rb') as f:
            attach = MIMEApplication(f.read(), _subtype='zip')
            attach.add_header('Content-Disposition', 'attachment', filename=file)
            msg.attach(attach)

    # Use TLS encryption (STARTTLS)
    s = smtplib.SMTP(host=SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
    s.starttls()

    # Login with App Password
    s.login(SENDER_ADDRESS, SENDER_APP_PASSWORD)

    # Send the email
    s.send_message(msg)

    # Quit the SMTP session
    s.quit()
    return True

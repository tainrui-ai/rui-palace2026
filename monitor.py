import json
import os
import subprocess
import requests
from email.mime.text import MIMEText
import smtplib

TARGET_URLS = {
    "https://www.rui-palace.com": "蕊宫首页",
    "https://www.rui-palace.com/aesthetics": "美学页面",
    "https://www.rui-palace.com/guqin": "古琴页面",
    "https://www.rui-palace.com/wellness": "身心健康页面",
    "https://www.rui-palace.com/notes": "笔记页面",
    "https://www.rui-palace.com/child": "童心世界页面"
}
REQUIRED_KEYWORD = "蕊宫"
ALERT_EMAIL = "rui.tian@hotmail.com"

SMTP_SERVER = os.environ.get("SMTP_SERVER")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 465))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

def send_alert_email(subject, content):
    if not all([SMTP_SERVER, SMTP_USER, SMTP_PASSWORD]): return
    msg = MIMEText(content, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = ALERT_EMAIL
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [ALERT_EMAIL], msg.as_string())

def update_status_file(status_data):
    with open("status.json", "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=2)
    subprocess.run(["git", "config", "--global", "user.name", "SecurityBot"], check=True)
    subprocess.run(["git", "config", "--global", "user.email", "bot@monitor.local"], check=True)
    subprocess.run(["git", "add", "status.json"], check=True)
    if subprocess.run(["git", "diff", "--staged", "--quiet"]).returncode != 0:
        subprocess.run(["git", "commit", "-m", "Security Auto-Lock [skip ci]"], check=True)
        subprocess.run(["git", "push"], check=True)

def check():
    status_data = {}
    if os.path.exists("status.json"):
        with open("status.json", "r", encoding="utf-8") as f: status_data = json.load(f)
    
    error_msgs = []
    changed = False
    for url, name in TARGET_URLS.items():
        try:
            resp = requests.get(url, timeout=10)
            is_bad = resp.status_code != 200 or REQUIRED_KEYWORD not in resp.text
        except: is_bad = True
        
        if is_bad:
            if not status_data.get(url, {}).get("locked"):
                status_data[url] = {"locked": True, "message": "异常"}
                changed = True
                error_msgs.append(f"【紧急锁死】方位: {name} ({url})")
        elif status_data.get(url, {}).get("locked"):
            status_data[url] = {"locked": False, "message": "正常"}
            changed = True
    
    if changed:
        update_status_file(status_data)
        if error_msgs:
            send_alert_email("【蕊宫预警】检测到异常并已自动锁死", "\n".join(error_msgs))

if __name__ == "__main__": check()
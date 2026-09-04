(function() {
    // 1. 自动注入弹窗所需的 CSS 样式
    const styleId = 'rui-cookie-banner-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #cookie-consent {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            #cookie-consent .modal-box {
                background: #ffffff;
                padding: 30px;
                border-radius: 8px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                text-align: left;
                border: 1px solid #e6dec5;
            }
            #cookie-consent h3 {
                margin-top: 0;
                font-size: 1.15rem;
                color: #2c2a29;
                margin-bottom: 12px;
            }
            #cookie-consent p {
                font-size: 0.9rem;
                color: #615b56;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            #cookie-consent .button-group {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-bottom: 15px;
            }
            #cookie-consent button {
                padding: 10px 18px;
                font-size: 0.85rem;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #2c2a29;
                transition: all 0.3s;
            }
            #cookie-consent #reject-btn {
                background: transparent;
                color: #2c2a29;
            }
            #cookie-consent #reject-btn:hover {
                background: #f4efe6;
            }
            #cookie-consent #accept-btn {
                background: #2c2a29;
                color: #f4efe6;
            }
            #cookie-consent #accept-btn:hover {
                background: #4a4541;
            }
            #cookie-consent .footer-links {
                font-size: 0.75rem;
                color: #9e9589;
                text-align: center;
                border-top: 1px solid #f4efe6;
                padding-top: 12px;
            }
            #cookie-consent .footer-links a {
                color: #615b56;
                text-decoration: none;
                margin: 0 8px;
            }
            #cookie-consent .footer-links a:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. 自动注入弹窗的 HTML 结构到页面底部
    if (!document.getElementById('cookie-consent')) {
        const bannerDiv = document.createElement('div');
        bannerDiv.id = 'cookie-consent';
        bannerDiv.style.display = 'none';
        bannerDiv.innerHTML = `
            <div class="modal-box">
                <h3>蕊宫隐私说明 / Privacy Notice</h3>
                <p>蕊宫尊重并珍视您的隐私。为了提供安全的服务，本站使用必要的 Cookie 与技术。点击“全部同意”即代表您许可我们为您提供更顺畅的体验。<br><span style="font-size: 0.8rem; color: #9e9589;">Rui Palace values your privacy. By clicking 'Accept All', you consent to our use of cookies.</span></p>
                <div class="button-group">
                    <button id="reject-btn">全部拒绝 / Reject All</button>
                    <button id="accept-btn">全部同意 / Accept All</button>
                </div>
                <div class="footer-links">
                    <a href="impressum.html">Impressum</a> | 
                    <a href="Datenschutz.html">Datenschutz</a>
                </div>
            </div>
        `;
        document.body.appendChild(bannerDiv);
    }

    // 3. 全局暴露重置 Cookie 的函数（供唤起弹窗使用）
    window.resetCookieConsent = function() {
        localStorage.removeItem('cookie_consent');
        document.cookie = "cookie_consent=; domain=rui-palace.com; path=/; max-age=0; SameSite=Lax";
        let modal = document.getElementById("cookie-consent");
        if (modal) {
            modal.style.opacity = "1";
            modal.style.display = "flex";
        } else {
            location.reload();
        }
    };

    // 4. 核心逻辑与智能 Footer 注入
    document.addEventListener("DOMContentLoaded", function() {
        const modal = document.getElementById("cookie-consent");
        const acceptBtn = document.getElementById("accept-btn");
        const rejectBtn = document.getElementById("reject-btn");

        // 智能查找 footer 并在其中追加“Cookie-Einstellungen”（自带防重校验，绝不重复）
        const footer = document.querySelector("footer");
        if (footer) {
            if (!footer.innerHTML.includes("Cookie-Einstellungen")) {
                const settingsSpan = document.createElement("span");
                settingsSpan.style.marginLeft = "10px";
                settingsSpan.innerHTML = ` | <a href="javascript:void(0);" onclick="resetCookieConsent()" style="color: inherit; text-decoration: none; cursor: pointer;">Cookie-Einstellungen</a>`;
                footer.appendChild(settingsSpan);
            }
        }

        // 统一检查 Cookie 和 LocalStorage
        const getConsentValue = () => {
            const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));
            if (cookieMatch) {
                return cookieMatch.split('=')[1];
            }
            return localStorage.getItem('cookie_consent');
        };

        const consentValue = getConsentValue();

        if (consentValue !== null) {
            if (modal) modal.style.display = "none";
            if (consentValue === 'true') {
                initAnalytics();
            }
        } else {
            if (modal) modal.style.display = "flex";
        }

        function dismiss() {
            if (modal) {
                modal.style.transition = "opacity 0.5s ease";
                modal.style.opacity = "0";
                setTimeout(() => {
                    modal.style.display = "none";
                }, 500);
            }
        }

        if (acceptBtn) {
            acceptBtn.onclick = function() {
                document.cookie = "cookie_consent=true; domain=rui-palace.com; path=/; max-age=31536000; SameSite=Lax";
                localStorage.setItem("cookie_consent", "true");
                dismiss();
                initAnalytics();
            };
        }

        if (rejectBtn) {
            rejectBtn.onclick = function() {
                document.cookie = "cookie_consent=false; domain=rui-palace.com; path=/; max-age=31536000; SameSite=Lax";
                localStorage.setItem("cookie_consent", "false");
                dismiss();
            };
        }
    });

    // 5. 访问统计与时长记录模块（安全合规封装）
    function initAnalytics() {
        const SUPABASE_URL = 'https://tbridsdkmqcbhnqodwzt.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_FmUorhl55A1wfmL3K4nB5w_t3NwSa9S';

       if (typeof supabase === 'undefined') {
            let script = document.createElement('script');
            script.src = 'supabase.js'; // 指向您本地服务器上的文件
            document.head.appendChild(script);
        }

        const fileName = window.location.pathname.split("/").pop() || "index.html";
        const clickDate = new Date().toISOString().split('T')[0];
        let startTime = Date.now();

        function sendVisitData(durationSeconds) {
            if (durationSeconds <= 0) return;
            try {
                const url = `${SUPABASE_URL}/rest/v1/page_stats`;
                const data = JSON.stringify({
                    file_name: fileName,
                    click_date: clickDate,
                    duration: durationSeconds
                });

                if (navigator.sendBeacon) {
                    const blob = new Blob([data], { type: 'application/json' });
                    navigator.sendBeacon(url, blob);
                } else {
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        },
                        body: data,
                        keepalive: true
                    });
                }
            } catch (err) {
                console.error("数据上报异常", err);
            }
        }

        setTimeout(() => {
            sendVisitData(5); 
        }, 1000);

        window.addEventListener('beforeunload', () => {
            let durationSeconds = Math.round((Date.now() - startTime) / 1000);
            sendVisitData(durationSeconds);
        });
    }
})();

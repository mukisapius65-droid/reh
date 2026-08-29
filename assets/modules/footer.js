// assets/modules/footer.js
import { showToast } from '../utils.js';

const footerHTML = `
<div class="footer-grid">
    <!-- About -->
    <div class="footer-col">
        <h4>About Reh</h4>
        <p>Reh is the world’s most exclusive dating circle — where extraordinary hearts find home. Curated connections,
            luxury events, and a 24/7 concierge make every encounter a masterpiece.</p>
        <div class="footer-social">
            <a href="https://www.instagram.com/rehcrown?igsi=ZGRyeGc2NnB3azcz"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://vm.tiktok.com/ZS9BhLYLd2Jtc-uQBvC"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://x.com/Rehhcxm"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="https://youtube.com/@rehcrown?si=cmEBpwkYZNfYYl9k"><i class="fa-brands fa-youtube"></i></a>
        </div>
    </div>
    <!-- Quick Links -->
    <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
            <li><a href="index.html?redirect=discover.html">Discover</a></li>
            <li><a href="index.html?redirect=elite.html">Crown Elite</a></li>
            <li><a href="index.html?redirect=events.html">Events</a></li>
            <li><a href="index.html?redirect=concierge.html">Concierge</a></li>
            <li><a href="plans.html">Membership Plans</a></li>
            <li><a href="index.html?redirect=tell-a-friend.html">Invite Friends</a></li>
        </ul>
    </div>
    <!-- Support -->
    <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#" data-footer="help">Help Centre</a></li>
          <li><a href="#" data-footer="safety">Safety Tips</a></li>
          <li><a href="#" data-footer="contact">Contact Concierge</a></li>
          <li><a href="#" data-footer="report">Report a Profile</a></li>
          <li><a href="#" data-footer="community">Community Guidelines</a></li>
        </ul>
    </div>
    <!-- Legal & Newsletter -->
    <div class="footer-col">
        <h4>Legal</h4>
        <ul>
            <li><a href="index.html?redirect=the-iron-convenant.html">Privacy Policy</a></li>
            <li><a href="#" data-footer="terms">Terms of Service</a></li>
            <li><a href="#" data-footer="cookies">Cookie Policy</a></li>
            <li><a href="#" data-footer="gdpr">GDPR Compliance</a></li>
        </ul>
        <h4 style="margin-top:1.5rem;">Newsletter</h4>
        <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" id="newsletterEmail">
            <button id="subscribeBtn"><i class="fa-solid fa-paper-plane"></i> Subscribe</button>
        </div>
    </div>
</div>
<div class="footer-bottom">
    <p>&copy; 2026 <span>Reh</span> — Crown Elite. All Rights Reserved.</p>
</div>`;

const modalHTML = `
<div class="modal-overlay" id="footerModal">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="footerModalTitle"></h3>
      <button class="modal-close" id="footerModalClose">&times;</button>
    </div>
    <div class="modal-body" id="footerModalBody"></div>
  </div>
</div>
`;

const modalContent = {
  help: {
    title: "Help Centre",
    body: `<p>Welcome to Reh Support. Here are some quick guides:</p>
           <ul>
             <li><strong>Getting Started:</strong> Complete your profile and browse Discover.</li>
             <li><strong>Matches:</strong> Use the search and filters to find extraordinary people.</li>
             <li><strong>Events:</strong> Request invitations to exclusive gatherings.</li>
             <li><strong>Concierge:</strong> Chat with our team for personalised help.</li>
           </ul>
           <p>For immediate assistance, contact <a href="mailto:support@reh.com" style="color:var(--gold);">support@reh.com</a>.</p>`,
  },
  safety: {
    title: "Safety Tips",
    body: `<p>Your safety is paramount. Follow these guidelines:</p>
           <ul>
             <li>Keep personal information private until trust is established.</li>
             <li>Always meet in public, luxury venues.</li>
             <li>Report suspicious behaviour immediately.</li>
             <li>Use our block feature to stop unwanted contact.</li>
           </ul>
           <p>Reh is committed to creating a secure environment for all members.</p>`,
  },
  community: {
    title: "Community Guidelines",
    body: `<p>Reh is built on respect and elegance:</p>
           <ul>
             <li>Treat others with kindness and courtesy.</li>
             <li>No harassment, hate speech, or inappropriate content.</li>
             <li>Profiles must be genuine and accurate.</li>
             <li>Violations may result in suspension or permanent ban.</li>
           </ul>
           <p>Together we maintain a sanctuary for genuine connections.</p>`,
  },
  contact: {
    title: "Contact Concierge",
    body: `<p>Our concierge team is available 24/7 to assist you with anything from date planning to technical support.</p>
           <p>Email: <a href="mailto:concierge@reh.com" style="color:var(--gold);">concierge@reh.com</a></p>`,
  },
  report: {
    title: "Report a Profile",
    body: `<p>If you encounter a profile that violates our guidelines, please let us know.</p>
           <input type="email" id="reportEmail" placeholder="Profile email to report" required>
           <textarea id="reportReason" rows="3" placeholder="Reason for report"></textarea>
           <button id="submitReportBtn">Submit Report</button>`,
  },
  terms: {
    title: "Terms of Service",
    body: `<h4>Effective Date: January 1, 2026</h4>
         <p>Welcome to <strong>Reh</strong>. By accessing or using our website, mobile application, or any related services (collectively, the “Service”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you may not use the Service.</p>
         <h5>1. Eligibility</h5>
         <p>You must be at least 18 years old to use Reh. By creating an account, you represent and warrant that you meet this age requirement.</p>
         <h5>2. Account Responsibilities</h5>
         <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.</p>
         <h5>3. User Conduct</h5>
         <p>You agree not to:</p>
         <ul>
           <li>Harass, abuse, or harm other users</li>
           <li>Post false, misleading, or fraudulent content</li>
           <li>Impersonate any person or entity</li>
           <li>Use the Service for any illegal purpose</li>
           <li>Scrape or collect data from the Service without permission</li>
         </ul>
         <h5>4. Premium Memberships & Payments</h5>
         <p>Certain features require a paid subscription. Fees are non‑refundable except as required by law. Reh reserves the right to change subscription fees upon reasonable notice.</p>
         <h5>5. Privacy</h5>
         <p>Your privacy is important to us. Please review our <a href="#" data-footer="privacy">Privacy Policy</a> and <a href="#" data-footer="cookies">Cookie Policy</a>.</p>
         <h5>6. Termination</h5>
         <p>We may suspend or terminate your account at any time, with or without cause, and without prior notice. Upon termination, your right to use the Service will immediately cease.</p>
         <h5>7. Disclaimers & Limitation of Liability</h5>
         <p>Reh is provided “as is” without warranties of any kind. To the fullest extent permitted by law, Reh shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>
         <h5>8. Changes to Terms</h5>
         <p>We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use after the effective date constitutes acceptance of the new Terms.</p>
         <h5>9. Contact</h5>
         <p>For questions about these Terms, contact <a href="mailto:legal@reh.com" style="color:var(--gold);">legal@reh.com</a>.</p>`
  },
  cookies: {
    title: "Cookie Policy",
    body: `<h4>Last updated: January 1, 2026</h4>
         <p>This Cookie Policy explains how Reh uses cookies and similar technologies to recognise you when you visit our website.</p>
         <h5>What are cookies?</h5>
         <p>Cookies are small data files that are placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.</p>
         <h5>How we use cookies</h5>
         <p>We use cookies for the following purposes:</p>
         <ul>
           <li><strong>Essential cookies:</strong> Necessary for the operation of the Service (e.g., keeping you logged in).</li>
           <li><strong>Analytical/performance cookies:</strong> Allow us to recognise and count the number of visitors and see how visitors move around the site (Google Analytics).</li>
           <li><strong>Functionality cookies:</strong> Used to recognise you when you return to our site.</li>
         </ul>
         <h5>Third‑party cookies</h5>
         <p>Some cookies may be set by third parties (e.g., Google Analytics) to provide measurement services.</p>
         <h5>Your choices</h5>
         <p>You can block cookies by activating the setting on your browser that allows you to refuse the setting of all or some cookies. However, if you block essential cookies, you may not be able to access all or parts of the Service.</p>
         <h5>More information</h5>
         <p>If you have any questions about our use of cookies, please contact <a href="mailto:privacy@reh.com" style="color:var(--gold);">privacy@reh.com</a>.</p>`
  },
  gdpr: {
    title: "GDPR Compliance",
    body: `<h4>Your Rights under the General Data Protection Regulation (GDPR)</h4>
         <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Reh is the data controller of your personal information.</p>
         <h5>Your GDPR Rights</h5>
         <ul>
           <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
           <li><strong>Right to Rectification:</strong> You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
           <li><strong>Right to Erasure:</strong> You can request that we erase your personal data, under certain conditions.</li>
           <li><strong>Right to Restrict Processing:</strong> You can request that we restrict the processing of your personal data.</li>
           <li><strong>Right to Object to Processing:</strong> You can object to our processing of your personal data.</li>
           <li><strong>Right to Data Portability:</strong> You can request that we transfer the data we have collected to another organisation, or directly to you.</li>
         </ul>
         <h5>Lawful Basis for Processing</h5>
         <p>We process your personal data based on your consent, the performance of a contract, compliance with legal obligations, and/or our legitimate interests.</p>
         <h5>Data Retention</h5>
         <p>We will retain your personal data only for as long as is necessary for the purposes set out in our Privacy Policy.</p>
         <h5>Contact & Complaints</h5>
         <p>To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:dpo@reh.com" style="color:var(--gold);">dpo@reh.com</a>. You also have the right to lodge a complaint with your local supervisory authority.</p>`
  }
};

export function initFooter() {
  const footerContainer = document.querySelector('footer');
  if (!footerContainer) return;
  if (footerContainer.querySelector('.footer-grid')) return;

  footerContainer.innerHTML = footerHTML;

  if (!document.getElementById('footerModal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const footerModal = document.getElementById('footerModal');
  const footerModalTitle = document.getElementById('footerModalTitle');
  const footerModalBody = document.getElementById('footerModalBody');
  const footerModalClose = document.getElementById('footerModalClose');

  function openFooterModal(title, bodyHTML) {
    footerModalTitle.textContent = title;
    footerModalBody.innerHTML = bodyHTML;
    footerModal.classList.add('active');
  }

  footerModalClose.addEventListener('click', () => footerModal.classList.remove('active'));
  footerModal.addEventListener('click', (e) => {
    if (e.target === footerModal) footerModal.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-footer]');
    if (!link) return;
    e.preventDefault();
    const page = link.getAttribute('data-footer');

    if (page === 'report') {
      openFooterModal('Report a Profile', modalContent.report.body);
      setTimeout(() => {
        const submitBtn = document.getElementById('submitReportBtn');
        if (submitBtn) {
          submitBtn.addEventListener('click', async () => {
            const email = document.getElementById('reportEmail').value.trim();
            const reason = document.getElementById('reportReason').value.trim();
            if (!email) {
              showToast('Please enter the profile email.');
              return;
            }
            const currentUser = JSON.parse(localStorage.getItem('reh_user') || '{}');
            try {
              if (!window.db || !window.collection || !window.addDoc) {
                showToast('Service unavailable. Please try again later.');
                return;
              }
              await window.addDoc(window.collection(window.db, 'reports'), {
                reported: email,
                reason,
                reporter: currentUser.email || 'anonymous',
                reporterName: (currentUser.firstName + ' ' + currentUser.lastName).trim() || 'Unknown',
                timestamp: window.serverTimestamp ? window.serverTimestamp() : new Date(),
                status: 'new'
              });
              showToast('Report submitted. Thank you for helping keep Reh safe.');
              footerModal.classList.remove('active');
              document.getElementById('reportEmail').value = '';
              document.getElementById('reportReason').value = '';
            } catch (error) {
              console.error('Error submitting report:', error);
              showToast('Failed to submit report. Please try again.');
            }
          });
        }
      }, 100);
    } else if (modalContent[page]) {
      openFooterModal(modalContent[page].title, modalContent[page].body);
    }
  });
}
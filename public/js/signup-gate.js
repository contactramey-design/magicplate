/**
 * MagicPlate Signup Gate
 * Injects a full-page signup overlay on tool pages that require a plan.
 * Include this script at the end of <body> on any gated page.
 *
 * Usage: <script src="/js/signup-gate.js" data-feature="social-media" data-tier="Starter+"></script>
 */
(function () {
  'use strict';

  // If user already signed up, skip the gate
  if (localStorage.getItem('mp_signed_up') === 'true') return;

  // Get metadata from the script tag
  var script = document.currentScript || document.querySelector('script[src*="signup-gate"]');
  var feature = (script && script.getAttribute('data-feature')) || 'this tool';
  var tier = (script && script.getAttribute('data-tier')) || 'Professional';

  // Build the overlay
  var overlay = document.createElement('div');
  overlay.id = 'mpSignupGate';
  overlay.innerHTML = '' +
    '<div style="position:fixed;inset:0;background:rgba(15,15,25,0.92);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;">' +
      '<div style="background:white;border-radius:20px;padding:48px;max-width:500px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:mpGateIn 0.4s ease-out;">' +
        '<div style="font-size:3em;margin-bottom:16px;">🔒</div>' +
        '<h2 style="font-size:1.7em;font-weight:800;color:#1a1a1a;margin-bottom:10px;">Unlock ' + feature + '</h2>' +
        '<p style="color:#666;margin-bottom:24px;font-size:1.05em;line-height:1.5;">This feature is available on the <strong style="color:#4caf50;">' + tier + '</strong> plan and above. Sign up and we\'ll contact you to get started.</p>' +
        '<form id="mpGateForm" style="text-align:left;">' +
          '<label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;color:#333;">Your Name</label>' +
          '<input type="text" name="name" required placeholder="John Smith" style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:15px;margin-bottom:14px;font-family:inherit;">' +
          '<label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;color:#333;">Email Address</label>' +
          '<input type="email" name="email" required placeholder="john@restaurant.com" style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:15px;margin-bottom:14px;font-family:inherit;">' +
          '<label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;color:#333;">Restaurant Name</label>' +
          '<input type="text" name="restaurant" placeholder="Joe\'s Diner" style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:15px;margin-bottom:14px;font-family:inherit;">' +
          '<button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#4caf50,#66bb6a);color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:6px;transition:all 0.3s;">Sign Up — Get Contacted</button>' +
        '</form>' +
        '<div id="mpGateSuccess" style="display:none;padding:20px;">' +
          '<div style="font-size:3em;margin-bottom:12px;">🎉</div>' +
          '<h3 style="color:#4caf50;font-size:1.4em;margin-bottom:8px;">You\'re All Set!</h3>' +
          '<p style="color:#666;">Thanks for signing up! We\'ll contact you within 24 hours.</p>' +
          '<a href="/features.html#pricing" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#4caf50,#66bb6a);color:white;border-radius:10px;text-decoration:none;font-weight:700;">View Plans</a>' +
          '<button onclick="document.getElementById(\'mpSignupGate\').remove();" style="display:block;margin:16px auto 0;background:none;border:none;color:#999;cursor:pointer;font-size:14px;text-decoration:underline;">Continue Previewing →</button>' +
        '</div>' +
        '<p style="margin-top:16px;font-size:13px;color:#999;">Or <a href="/features.html" style="color:#4caf50;text-decoration:none;font-weight:600;">browse all features</a> &middot; <a href="/" style="color:#4caf50;text-decoration:none;font-weight:600;">back to homepage</a></p>' +
      '</div>' +
    '</div>';

  // Add animation keyframes
  var style = document.createElement('style');
  style.textContent = '@keyframes mpGateIn { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }';
  document.head.appendChild(style);

  document.body.appendChild(overlay);

  // Handle form submission
  document.getElementById('mpGateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    var lead = {
      name: form.name.value,
      email: form.email.value,
      restaurant: form.restaurant.value,
      feature: feature,
      tier: tier,
      date: new Date().toISOString()
    };

    // Store locally
    var leads = JSON.parse(localStorage.getItem('mp_leads') || '[]');
    leads.push(lead);
    localStorage.setItem('mp_leads', JSON.stringify(leads));
    localStorage.setItem('mp_signed_up', 'true');

    // Try to send to server
    try {
      fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      }).catch(function () {});
    } catch (err) { /* ignore */ }

    // Show success
    form.style.display = 'none';
    document.getElementById('mpGateSuccess').style.display = 'block';
  });
})();

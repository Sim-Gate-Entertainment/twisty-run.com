'use strict';

// Twisty Race website stream in the existing TwistyRun GA4 property.
const MEASUREMENT_ID = 'G-6KNFERD5PB';
const CONSENT_KEY = 'twisty_website_analytics_v1';
let analyticsAllowed = false;
let analyticsStarted = false;
const consentPanel = document.getElementById('analytics-consent');
const settingsButton = document.getElementById('analytics-settings');
const allowButton = document.getElementById('analytics-allow');
const declineButton = document.getElementById('analytics-decline');

function readChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
    if (saved && (saved.choice === 'allowed' || saved.choice === 'declined') &&
        Date.now() - saved.savedAt < 180 * 24 * 60 * 60 * 1000) return saved.choice;
  } catch (_) { /* Storage can be unavailable in private browsing. */ }
  return null;
}

function track(name, parameters) {
  if (analyticsAllowed && typeof window.gtag === 'function') window.gtag('event', name, parameters);
}

function startAnalytics() {
  analyticsAllowed = true;
  window['ga-disable-' + MEASUREMENT_ID] = false;
  if (analyticsStarted) {
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    return;
  }
  analyticsStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: 'https://twisty-run.com' + location.pathname,
    page_referrer: safeReferrer(),
    ...campaignContext()
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(script);
  track('page_view', {page_title:document.title,page_location:'https://twisty-run.com' + location.pathname,page_referrer:safeReferrer()});
}

function safeReferrer() {
  try { return document.referrer ? new URL(document.referrer).origin : ''; }
  catch (_) { return ''; }
}

function campaignContext() {
  // Only published campaign labels are accepted, never arbitrary query text.
  const params = new URLSearchParams(location.search);
  const sources = ['youtube','tiktok','instagram','reddit','facebook','linkedin'];
  const campaigns = ['escape_clip','jump_clip','road_clip'];
  const source = params.get('utm_source');
  const campaign = params.get('utm_campaign');
  if (!sources.includes(source) || !campaigns.includes(campaign)) return {};
  return {campaign_source:source,campaign_medium:source === 'youtube' ? 'organic_video' : 'organic_social',campaign_name:campaign};
}

function chooseAnalytics(choice) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({choice:choice,savedAt:Date.now()})); }
  catch (_) { /* Choice still applies to this page when storage is blocked. */ }
  if (choice === 'allowed') {
    startAnalytics();
  } else {
    analyticsAllowed = false;
    window['ga-disable-' + MEASUREMENT_ID] = true;
    if (typeof window.gtag === 'function') window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    // Remove this site's GA cookies after withdrawal; the local preference is retained.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        for (const domain of ['', ';domain=' + location.hostname, ';domain=.' + location.hostname]) {
          document.cookie = name + '=;Max-Age=0;path=/' + domain + ';SameSite=Lax';
        }
      }
    }
  }
  consentPanel.hidden = true;
  settingsButton.focus({preventScroll:true});
}

if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) {
  throw new Error('Website analytics requires the configured GA4 web-stream measurement ID.');
}
{
  settingsButton.hidden = false;
  const choice = readChoice();
  if (choice === 'allowed') startAnalytics();
  else if (!choice) consentPanel.hidden = false;
  settingsButton.addEventListener('click', () => {consentPanel.hidden = false; allowButton.focus({preventScroll:true});});
  allowButton.addEventListener('click', () => chooseAnalytics('allowed'));
  declineButton.addEventListener('click', () => chooseAnalytics('declined'));
}

for (const link of document.querySelectorAll('[data-store]')) {
  link.addEventListener('click', () => track('store_click', {store:link.dataset.store,placement:link.dataset.placement,transport_type:'beacon'}));
}

const videoLaunch = document.getElementById('video-launch');
if (videoLaunch) videoLaunch.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/lVteaW3lSBA?autoplay=1&rel=0';
  frame.title = 'Twisty Race: Cat Bike Rider gameplay trailer';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  document.getElementById('video-shell').replaceChildren(frame);
  frame.focus();
  track('trailer_play', {placement:'trailer'});
});

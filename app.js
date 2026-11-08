const STORAGE_KEY = 'itau_app_config_v1';

const DEFAULT_CONFIG = {
  userName: 'John',
  userInitials: 'JO',
  accountLabel: 'Ag ••16 Conta •••07-7',
  nivelLabel: 'Nível 5',
  accountBalance: 'R$ 1.662,01',
  accountLimit: 'R$ 400,00',
  cardName: 'Itau Multiplo Gold final 7347',
  cardInvoice: 'R$ 0,00',
  cardBestDate: 'Melhor data de compras: 03 dez',
  cardLimit: 'R$ 200,00',
  payTotal: 'R$ 430,25',
  payOverdue: 'R$ 0,00',
  payUpcoming: 'R$ 430,25',
  payBadge: '4',
  payScheduled: 'R$ 0,00',
  txDate: '09 de novembro de 2026',
  transactions: [
    {
      type: '',
      name: 'John Eric Mendes De Oliveira',
      amount: '- R$ 208,00',
      icon: 'transfer'
    },
    {
      type: 'Pagamento de boleto',
      name: 'Ativos S.a. Securitizadora De Creditos Financeiros',
      amount: '- R$ 163,72',
      icon: 'boleto_plus'
    },
    {
      type: 'Pagamento de boleto',
      name: 'Virtuali Solucoes Em Telecomunicacao Ltda',
      amount: '- R$ 65,00',
      icon: 'house'
    },
    {
      type: 'Pagamento de boleto',
      name: 'Srg Telecom Ltda',
      amount: '- R$ 129,90',
      icon: 'house'
    },
    {
      type: 'Pagamento de boleto',
      name: 'Brasil Card Instituicao De Pagamentos Lt',
      amount: '- R$ 108,71',
      icon: 'card'
    }
  ]
};

let appConfig = loadConfig();
let splashTimeout = null;
let faceIdTimeout = null;
let balancesHidden = false;

const screens = {
  splash: document.getElementById('screen-splash'),
  prelogin: document.getElementById('screen-prelogin'),
  app: document.getElementById('screen-app')
};

const statusBar = document.getElementById('ios-status-bar');
const statusTime = document.getElementById('status-time');
const statusLocIcon = document.getElementById('status-loc-icon');
const metaThemeColor = document.getElementById('meta-theme-color');
const faceIdOverlay = document.getElementById('faceid-overlay');
const adminModal = document.getElementById('admin-modal');

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const parsed = JSON.parse(raw);
    return {
      ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
      ...parsed,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : JSON.parse(JSON.stringify(DEFAULT_CONFIG.transactions))
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function getTxIconSvg(iconType) {
  switch (iconType) {
    case 'transfer':
      return `
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="#3A3A3C" stroke-width="1.9" stroke-linecap="round">
          <line x1="6" y1="11" x2="21" y2="11"/><polyline points="16.5 6.5 21 11 16.5 15.5"/>
          <line x1="21" y1="17" x2="6" y2="17"/><polyline points="10.5 12.5 6 17 10.5 21.5"/>
        </svg>`;
    case 'boleto_plus':
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.8" stroke-linecap="round">
          <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
          <path d="M11 10.5c-.8-.6-2.5-.3-2.5.8 0 1.3 3 1.1 3 2.5 0 1.1-1.7 1.3-2.6.7M10 9v6"/>
          <line x1="18" y1="3" x2="18" y2="9"/><line x1="15" y1="6" x2="21" y2="6"/>
        </svg>`;
    case 'card':
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.8">
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <line x1="6.5" y1="10.5" x2="9" y2="10.5" />
        </svg>`;
    case 'house':
    default:
      return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.8" stroke-linejoin="round">
          <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-8z"/>
        </svg>`;
  }
}

function setMonetaryElement(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.real = val;
  el.textContent = balancesHidden ? '••••' : val;
}

function applyConfigToUI() {
  // Titular & Conta
  const preInitials = document.getElementById('ui-prelogin-initials');
  const homeInitials = document.getElementById('ui-home-initials');
  const greeting = document.getElementById('ui-prelogin-greeting');
  const accLabel = document.getElementById('ui-prelogin-account');
  const homeNivel = document.getElementById('ui-home-nivel');

  if (preInitials) preInitials.textContent = appConfig.userInitials;
  if (homeInitials) homeInitials.textContent = appConfig.userInitials;
  if (greeting) greeting.textContent = `Olá, ${appConfig.userName}`;
  if (accLabel) accLabel.textContent = appConfig.accountLabel;
  if (homeNivel) homeNivel.textContent = appConfig.nivelLabel;

  // Conta Corrente (Home e Extrato)
  setMonetaryElement('ui-home-balance', appConfig.accountBalance);
  setMonetaryElement('ui-extrato-balance', appConfig.accountBalance);
  setMonetaryElement('ui-home-limit', appConfig.accountLimit);
  setMonetaryElement('ui-extrato-limit', appConfig.accountLimit);

  // Cartão de Crédito
  const cardNameEl = document.getElementById('ui-card-name');
  const cardBestDateEl = document.getElementById('ui-card-bestdate');
  if (cardNameEl) cardNameEl.textContent = appConfig.cardName;
  if (cardBestDateEl) cardBestDateEl.textContent = appConfig.cardBestDate;
  setMonetaryElement('ui-card-invoice', appConfig.cardInvoice);
  setMonetaryElement('ui-card-limit', appConfig.cardLimit);

  // Pagamentos
  setMonetaryElement('ui-pay-total', appConfig.payTotal);
  setMonetaryElement('ui-pay-overdue', appConfig.payOverdue);
  setMonetaryElement('ui-pay-upcoming', appConfig.payUpcoming);
  setMonetaryElement('ui-pay-scheduled', appConfig.payScheduled);
  const badgeEl = document.getElementById('ui-pay-badge');
  if (badgeEl) {
    badgeEl.textContent = appConfig.payBadge;
    badgeEl.style.display = appConfig.payBadge && appConfig.payBadge !== '0' ? 'inline-flex' : 'none';
  }

  // Extrato Lançamentos
  const txDateEl = document.getElementById('ui-tx-date');
  if (txDateEl) txDateEl.textContent = appConfig.txDate;

  const txListEl = document.getElementById('ui-tx-list');
  if (txListEl) {
    let html = '';
    appConfig.transactions.forEach((tx, idx) => {
      const isBeforeBanner = idx === 2;
      const shownAmount = balancesHidden ? '••••' : tx.amount;
      html += `
        <div class="tx-item" ${isBeforeBanner ? 'style="border-bottom:none;"' : ''}>
          <div class="tx-left">
            <div class="tx-icon">${getTxIconSvg(tx.icon)}</div>
            <div class="tx-details">
              ${tx.type ? `<div class="tx-type">${escapeHtml(tx.type)}</div>` : ''}
              <div class="tx-name">${escapeHtml(tx.name)}</div>
              <div class="tx-amount monetary-val" data-real="${escapeHtml(tx.amount)}">${escapeHtml(shownAmount)}</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.8"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      `;

      if (isBeforeBanner) {
        html += `
          <div class="extrato-opinion-banner">
            <div class="opinion-left">
              <span class="id-orange-logo">iD</span>
              <div class="opinion-text">
                <h5>Compartilhe a sua opinião</h5>
                <p>O extrato está atendendo as suas expectativas?</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.8"><polyline points="9 6 15 12 9 18"/></svg>
          </div>
        `;
      }
    });
    txListEl.innerHTML = html;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setStatusBarStyle(mode, timeText = '22:33', bluePillLocation = false) {
  if (!statusBar) return;
  statusTime.textContent = timeText;
  if (mode === 'light') {
    statusBar.classList.remove('theme-dark-text');
    statusBar.classList.add('theme-light-text');
  } else {
    statusBar.classList.remove('theme-light-text');
    statusBar.classList.add('theme-dark-text');
  }

  if (bluePillLocation) {
    statusLocIcon.className = 'status-loc-pill';
    statusLocIcon.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" transform="rotate(45 12 12)"/>
      </svg>
    `;
  } else {
    statusLocIcon.className = 'status-loc-arrow';
    statusLocIcon.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" transform="rotate(45 12 12)"/>
      </svg>
    `;
  }
}

function hideAllScreens() {
  clearTimeout(splashTimeout);
  clearTimeout(faceIdTimeout);
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  faceIdOverlay.classList.remove('show');
}

function showSplash(autoAdvance = true) {
  hideAllScreens();
  screens.splash.classList.add('active');
  if (statusBar) statusBar.style.display = 'none';
  metaThemeColor.setAttribute('content', '#FE5301');

  if (autoAdvance) {
    splashTimeout = setTimeout(() => {
      showPreLogin();
    }, 1700);
  }
}

function showPreLogin() {
  hideAllScreens();
  screens.prelogin.classList.add('active');
  if (statusBar) statusBar.style.display = 'flex';
  setStatusBarStyle('dark', '22:32', true);
  metaThemeColor.setAttribute('content', '#F3F3F5');
}

function triggerFaceID(targetTab = 'home') {
  clearTimeout(faceIdTimeout);
  if (!screens.prelogin.classList.contains('active')) {
    hideAllScreens();
    screens.prelogin.classList.add('active');
  }
  if (statusBar) statusBar.style.display = 'flex';
  setStatusBarStyle('dark', '22:33', false);
  faceIdOverlay.classList.add('show');

  faceIdTimeout = setTimeout(() => {
    faceIdOverlay.classList.remove('show');
    openLoggedApp(targetTab);
  }, 1500);
}

function openLoggedApp(initialTab = 'home') {
  hideAllScreens();
  screens.app.classList.add('active');
  if (statusBar) statusBar.style.display = 'flex';
  switchAppTab(initialTab);
}

function switchAppTab(tabName) {
  const panes = {
    home: document.getElementById('tab-home'),
    extrato: document.getElementById('tab-extrato'),
    pagamentos: document.getElementById('tab-pagamentos'),
    pravc: document.getElementById('tab-pravc'),
    menu: document.getElementById('tab-menu')
  };

  Object.entries(panes).forEach(([key, pane]) => {
    if (pane) pane.classList.toggle('active', key === tabName);
  });

  document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  if (tabName === 'home') {
    setStatusBarStyle('light', '22:33', false);
    metaThemeColor.setAttribute('content', '#FF6201');
  } else {
    setStatusBarStyle('dark', '22:33', false);
    metaThemeColor.setAttribute('content', '#F1F2F4');
  }
}

function toggleBalancesVisibility() {
  balancesHidden = !balancesHidden;
  document.querySelectorAll('.monetary-val').forEach((el) => {
    el.textContent = balancesHidden ? '••••' : el.dataset.real;
  });
}

function selectEmoji(itemEl) {
  document.querySelectorAll('.emoji-item').forEach((el) => el.classList.remove('selected'));
  itemEl.classList.add('selected');
  const btn = document.getElementById('btn-enviar-avaliacao');
  if (btn) btn.classList.add('enabled');
}

function updateFeedbackCount(inputEl) {
  const counter = document.getElementById('feedback-counter');
  if (counter) {
    counter.textContent = `${inputEl.value.length}/140`;
  }
}

/* =========================================================
   PAINEL DE EDIÇÃO SECRETO (LONG PRESS EM "ACESSAR")
   ========================================================= */
function setupAcessarLongPress() {
  const card = document.getElementById('btn-acessar-card');
  if (!card) return;

  let pressTimer = null;
  let longPressOpened = false;
  let touchMoved = false;

  const startHold = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;
    longPressOpened = false;
    touchMoved = false;
    card.classList.add('holding');

    pressTimer = setTimeout(() => {
      longPressOpened = true;
      card.classList.remove('holding');
      if (navigator.vibrate) {
        try { navigator.vibrate(45); } catch (_) {}
      }
      openAdminModal();
    }, 600);
  };

  const cancelHold = () => {
    clearTimeout(pressTimer);
    card.classList.remove('holding');
  };

  const endHold = (e) => {
    clearTimeout(pressTimer);
    card.classList.remove('holding');
    if (longPressOpened || touchMoved) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    triggerFaceID('home');
  };

  card.addEventListener('touchstart', startHold, { passive: true });
  card.addEventListener('touchmove', () => {
    touchMoved = true;
    cancelHold();
  }, { passive: true });
  card.addEventListener('touchend', endHold);
  card.addEventListener('touchcancel', cancelHold);

  card.addEventListener('mousedown', startHold);
  card.addEventListener('mouseup', (e) => {
    if ('ontouchstart' in window) return;
    endHold(e);
  });
  card.addEventListener('mouseleave', cancelHold);
  card.addEventListener('contextmenu', (e) => e.preventDefault());
}

function renderAdminTxRows(txArray) {
  const container = document.getElementById('admin-tx-list');
  if (!container) return;
  container.innerHTML = '';

  txArray.forEach((tx, index) => {
    const row = document.createElement('div');
    row.className = 'admin-tx-card';
    row.innerHTML = `
      <div class="admin-tx-card-top">
        <strong style="font-size:12px;color:#00006A;">Lançamento #${index + 1}</strong>
        <button type="button" class="btn-remove-tx" onclick="removeAdminTxRow(${index})">Remover</button>
      </div>
      <div class="admin-row-2col">
        <div class="admin-field">
          <label>Tipo (opcional)</label>
          <input type="text" class="tx-inp-type" value="${escapeHtml(tx.type)}" placeholder="Pagamento de boleto" />
        </div>
        <div class="admin-field">
          <label>Ícone</label>
          <select class="tx-inp-icon">
            <option value="transfer" ${tx.icon === 'transfer' ? 'selected' : ''}>Transferência / Pix</option>
            <option value="boleto_plus" ${tx.icon === 'boleto_plus' ? 'selected' : ''}>Boleto ($+)</option>
            <option value="house" ${tx.icon === 'house' ? 'selected' : ''}>Casa / Conta</option>
            <option value="card" ${tx.icon === 'card' ? 'selected' : ''}>Cartão</option>
          </select>
        </div>
      </div>
      <div class="admin-row-2col">
        <div class="admin-field">
          <label>Nome / Descrição</label>
          <input type="text" class="tx-inp-name" value="${escapeHtml(tx.name)}" placeholder="Nome do recebedor" />
        </div>
        <div class="admin-field">
          <label>Valor</label>
          <input type="text" class="tx-inp-amount" value="${escapeHtml(tx.amount)}" placeholder="- R$ 100,00" />
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function collectAdminTxFromDOM() {
  const cards = document.querySelectorAll('#admin-tx-list .admin-tx-card');
  const list = [];
  cards.forEach((card) => {
    list.push({
      type: card.querySelector('.tx-inp-type')?.value.trim() || '',
      icon: card.querySelector('.tx-inp-icon')?.value || 'transfer',
      name: card.querySelector('.tx-inp-name')?.value.trim() || 'Transferência',
      amount: card.querySelector('.tx-inp-amount')?.value.trim() || '- R$ 0,00'
    });
  });
  return list;
}

function addAdminTxRow() {
  const current = collectAdminTxFromDOM();
  current.unshift({
    type: 'Pix enviado',
    name: 'Novo Lançamento',
    amount: '- R$ 100,00',
    icon: 'transfer'
  });
  renderAdminTxRows(current);
}

function removeAdminTxRow(index) {
  const current = collectAdminTxFromDOM();
  current.splice(index, 1);
  renderAdminTxRows(current);
}

function openAdminModal() {
  document.getElementById('cfg-userName').value = appConfig.userName;
  document.getElementById('cfg-userInitials').value = appConfig.userInitials;
  document.getElementById('cfg-accountLabel').value = appConfig.accountLabel;
  document.getElementById('cfg-nivelLabel').value = appConfig.nivelLabel;
  document.getElementById('cfg-accountBalance').value = appConfig.accountBalance;
  document.getElementById('cfg-accountLimit').value = appConfig.accountLimit;
  document.getElementById('cfg-cardName').value = appConfig.cardName;
  document.getElementById('cfg-cardInvoice').value = appConfig.cardInvoice;
  document.getElementById('cfg-cardBestDate').value = appConfig.cardBestDate;
  document.getElementById('cfg-cardLimit').value = appConfig.cardLimit;
  document.getElementById('cfg-payTotal').value = appConfig.payTotal;
  document.getElementById('cfg-payOverdue').value = appConfig.payOverdue;
  document.getElementById('cfg-payUpcoming').value = appConfig.payUpcoming;
  document.getElementById('cfg-payBadge').value = appConfig.payBadge;
  document.getElementById('cfg-payScheduled').value = appConfig.payScheduled;
  document.getElementById('cfg-txDate').value = appConfig.txDate;

  renderAdminTxRows(appConfig.transactions);
  adminModal.classList.add('open');
}

function closeAdminModal() {
  adminModal.classList.remove('open');
}

function saveAppConfig() {
  appConfig = {
    userName: document.getElementById('cfg-userName').value.trim() || 'John',
    userInitials: document.getElementById('cfg-userInitials').value.trim().toUpperCase() || 'JO',
    accountLabel: document.getElementById('cfg-accountLabel').value.trim() || 'Ag ••16 Conta •••07-7',
    nivelLabel: document.getElementById('cfg-nivelLabel').value.trim() || 'Nível 5',
    accountBalance: document.getElementById('cfg-accountBalance').value.trim() || 'R$ 0,00',
    accountLimit: document.getElementById('cfg-accountLimit').value.trim() || 'R$ 0,00',
    cardName: document.getElementById('cfg-cardName').value.trim() || 'Itau Multiplo Gold final 7347',
    cardInvoice: document.getElementById('cfg-cardInvoice').value.trim() || 'R$ 0,00',
    cardBestDate: document.getElementById('cfg-cardBestDate').value.trim() || 'Melhor data de compras: 03 dez',
    cardLimit: document.getElementById('cfg-cardLimit').value.trim() || 'R$ 0,00',
    payTotal: document.getElementById('cfg-payTotal').value.trim() || 'R$ 0,00',
    payOverdue: document.getElementById('cfg-payOverdue').value.trim() || 'R$ 0,00',
    payUpcoming: document.getElementById('cfg-payUpcoming').value.trim() || 'R$ 0,00',
    payBadge: document.getElementById('cfg-payBadge').value.trim() || '0',
    payScheduled: document.getElementById('cfg-payScheduled').value.trim() || 'R$ 0,00',
    txDate: document.getElementById('cfg-txDate').value.trim() || '09 de novembro de 2026',
    transactions: collectAdminTxFromDOM()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appConfig));
  } catch (_) {}

  applyConfigToUI();
  closeAdminModal();
}

function resetAppConfig() {
  appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
  applyConfigToUI();
  closeAdminModal();
}

// Sub-tabs toggle inside Extrato / Pagamentos
document.querySelectorAll('.underline-tabs').forEach((group) => {
  const tabs = group.querySelectorAll('.underline-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});

// Update Service Worker cache version
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  applyConfigToUI();
  setupAcessarLongPress();
  showSplash(true);
});

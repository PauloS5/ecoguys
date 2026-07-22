/* ==========================================================================
   EcoGuys – Interface Front-end Pronta para API Real
   ========================================================================== */

// Configuração Base da API (Altere conforme a URL do seu Back-end Spring Boot)
const API_BASE_URL = 'http://localhost:8080/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Ícones Lucide
  lucide.createIcons();

  // 2. Sistema de Roteamento SPA entre Telas
  setupNavigation();

  // 3. Inicializar Estrutura dos Gráficos (Aguardando Payloads da API)
  initChartStructures();

  // 4. Inicializar Mapa Interativo
  initInteractiveMap();

  // 5. Configurar Chatbot (Pronto para POST /api/v1/chat)
  setupChatbot();

  // 6. Modais e Notificações
  setupModalAndToasts();
});

/* ================= 1. Roteamento SPA ================= */
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      navigateTo(pageId);
    });
  });
}

function navigateTo(pageId) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    if (btn.getAttribute('data-page') === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.page-view').forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  if (pageId === 'mapa' && window.leafletMap) {
    setTimeout(() => { window.leafletMap.invalidateSize(); }, 200);
  }
}

/* ================= 2. Estruturas de Gráficos (Canvas Prontos) ================= */
let tempSparklineChart = null;
let main24hChart = null;

function initChartStructures() {
  // Sparkline Temperatura
  const sparkCtx = document.getElementById('tempSparkline');
  if (sparkCtx) {
    tempSparklineChart = new Chart(sparkCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{ data: [], borderColor: '#FB8C00', borderWidth: 2, pointRadius: 0, fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
  }

  // Gráfico 24 Horas Dashboard
  const dashCtx = document.getElementById('dashboard24hChart');
  if (dashCtx) {
    main24hChart = new Chart(dashCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Temperatura (°C)', data: [], borderColor: '#2E7D32', backgroundColor: 'rgba(46, 125, 50, 0.1)', fill: true },
          { label: 'Umidade (%)', data: [], borderColor: '#1565C0', borderDash: [5, 5] }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
    });
  }

  // Gráficos da Tela de Relatórios
  initReportChartPlaceholders();
}

function initReportChartPlaceholders() {
  const lineCtx = document.getElementById('reportLineChart');
  if (lineCtx) new Chart(lineCtx, { type: 'line', data: { labels: [], datasets: [{ label: 'Temp Média', data: [] }] }, options: { responsive: true, maintainAspectRatio: false } });

  const areaCtx = document.getElementById('reportAreaChart');
  if (areaCtx) new Chart(areaCtx, { type: 'line', data: { labels: [], datasets: [{ label: 'AQI', data: [], fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });

  const barCtx = document.getElementById('reportBarChart');
  if (barCtx) new Chart(barCtx, { type: 'bar', data: { labels: [], datasets: [{ label: 'Queimadas', data: [] }] }, options: { responsive: true, maintainAspectRatio: false } });

  const pieCtx = document.getElementById('reportPieChart');
  if (pieCtx) new Chart(pieCtx, { type: 'doughnut', data: { labels: ['Seguro', 'Atenção', 'Crítico'], datasets: [{ data: [0, 0, 0] }] }, options: { responsive: true, maintainAspectRatio: false } });
}

/* ================= 3. Mapa Interativo (Pronto para Camadas da API) ================= */
function initInteractiveMap() {
  const mapElement = document.getElementById('interactiveMap');
  if (!mapElement) return;

  // Mapa base centralizado no Brasil (Aguardando coordenadas da API)
  const map = L.map('interactiveMap', { zoomControl: false }).setView([-14.235, -51.925], 4);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap | EcoGuys API Ready'
  }).addTo(map);

  window.leafletMap = map;

  const drawer = document.getElementById('mapDrawer');
  document.getElementById('btnCloseDrawer')?.addEventListener('click', () => {
    drawer.classList.remove('open');
  });
}

/* ================= 4. Assistente Gemma AI (Chat Handler) ================= */
function setupChatbot() {
  const input = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSendChat');
  const btnClear = document.getElementById('btnClearChat');

  if (!btnSend || !input) return;

  btnSend.addEventListener('click', () => sendMessageToApi());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageToApi();
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      document.getElementById('chatStream').innerHTML = `
        <div class="chat-msg gemma">
          <div class="msg-avatar"><i data-lucide="sparkles"></i></div>
          <div class="msg-bubble"><p>Chat reiniciado. Envie sua consulta para a API.</p></div>
        </div>
      `;
      lucide.createIcons();
    });
  }
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatInput');
  input.value = promptText;
  sendMessageToApi();
}

async function sendMessageToApi() {
  const input = document.getElementById('chatInput');
  const stream = document.getElementById('chatStream');
  const userText = input.value.trim();

  if (!userText) return;

  // 1. Inserir Balão do Usuário
  const userMsgHtml = `
    <div class="chat-msg user">
      <div class="msg-avatar"><i data-lucide="user"></i></div>
      <div class="msg-bubble"><p>${escapeHtml(userText)}</p></div>
    </div>
  `;
  stream.insertAdjacentHTML('beforeend', userMsgHtml);
  input.value = '';
  lucide.createIcons();
  stream.scrollTop = stream.scrollHeight;

  // 2. Indicador de Carregamento da API
  const loadingId = 'loading-' + Date.now();
  const loadingHtml = `
    <div class="chat-msg gemma" id="${loadingId}">
      <div class="msg-avatar"><i data-lucide="sparkles"></i></div>
      <div class="msg-bubble"><p class="text-sub font-italic">Enviando requisição para <code>${API_BASE_URL}/chat</code>...</p></div>
    </div>
  `;
  stream.insertAdjacentHTML('beforeend', loadingHtml);
  stream.scrollTop = stream.scrollHeight;

  /* =========================================================================
     EXEMPLO DE INTEGRAÇÃO COM A SUA API REAL (Descomente quando o endpoint existir)
     =========================================================================
     try {
       const response = await fetch(`${API_BASE_URL}/chat`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: userText })
       });
       const data = await response.json();
       document.getElementById(loadingId)?.remove();
       stream.insertAdjacentHTML('beforeend', `
         <div class="chat-msg gemma">
           <div class="msg-avatar"><i data-lucide="sparkles"></i></div>
           <div class="msg-bubble"><p>${data.reply}</p></div>
         </div>
       `);
     } catch (err) {
       document.getElementById(loadingId)?.remove();
       stream.insertAdjacentHTML('beforeend', `
         <div class="chat-msg gemma">
           <div class="msg-avatar"><i data-lucide="alert-triangle"></i></div>
           <div class="msg-bubble"><p class="text-danger">Erro de Conexão: Endpoint ${API_BASE_URL}/chat não respondeu.</p></div>
         </div>
       `);
     }
  ========================================================================= */
}

/* ================= 5. Modais e Utilitários ================= */
function setupModalAndToasts() {
  const modal = document.getElementById('reportModal');
  const btnOpen = document.getElementById('btnOpenReportModal');
  const btnClose = document.getElementById('btnCloseReportModal');
  const btnCancel = document.getElementById('btnCancelReportModal');
  const btnConfirm = document.getElementById('btnConfirmGenerateReport');

  if (btnOpen) btnOpen.addEventListener('click', () => modal.classList.add('active'));
  if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
  if (btnCancel) btnCancel.addEventListener('click', () => modal.classList.remove('active'));

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      modal.classList.remove('active');
      showNotification('Solicitação de relatório enviada para o endpoint /reports/generate');
    });
  }

  document.getElementById('btnRefresh')?.addEventListener('click', () => {
    showNotification('Sincronização solicitada para a API!');
  });
}

function showNotification(msg) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

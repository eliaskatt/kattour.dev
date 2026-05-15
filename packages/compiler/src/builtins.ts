import { ElementNode, UINode } from './ast';
import { RuntimeScope, interpolateTemplate } from './expression';
import { escapeAttribute, escapeHtml, safeUrl } from './html';

export interface BuiltinRenderContext {
  state: RuntimeScope;
  scope: RuntimeScope;
  renderChildren: (children: UINode[]) => string;
}

export type BuiltinRenderer = (node: ElementNode, ctx: BuiltinRenderContext) => string;

export const BUILTIN_MODULES: Record<string, BuiltinRenderer> = {
  productsGrid: renderProductsGrid,
  productCard: renderProductCard,
  adminShell: renderAdminShell,
  adminSidebar: renderAdminSidebar,
  dataTable: renderDataTable,
  newsletterSignup: renderNewsletterSignup,
  pricingSection: renderPricingSection,
  checkoutSummary: renderCheckoutSummary,
  loginForm: renderLoginForm,
  registerForm: renderRegisterForm,
  statsOverview: renderStatsOverview,
  heroSection: renderHeroSection,
  featureGrid: renderFeatureGrid,
  testimonialWall: renderTestimonialWall,
  faqAccordion: renderFaqAccordion,
  contactForm: renderContactForm,
  orderTracking: renderOrderTracking,
  restaurantMenu: renderRestaurantMenu,
  bookingCalendar: renderBookingCalendar,
  notificationCenter: renderNotificationCenter,
  supportInbox: renderSupportInbox,
  crmPipeline: renderCrmPipeline,
  kanbanBoard: renderKanbanBoard,
  invoiceSummary: renderInvoiceSummary,
  paymentMethods: renderPaymentMethods,
  apiKeysPanel: renderApiKeysPanel,
  teamManagement: renderTeamManagement,
  roleMatrix: renderRoleMatrix,
  auditLog: renderAuditLog,
  aiChat: renderAiChat,
  aiPromptBuilder: renderAiPromptBuilder,
  mobileAppShowcase: renderMobileAppShowcase,
  dashboardLayout: renderDashboardLayout,
  searchFilters: renderSearchFilters,
  fileManager: renderFileManager,
  roadmapVoting: renderRoadmapVoting
};

export function isBuiltinModule(name: string): boolean {
  return name in BUILTIN_MODULES;
}

export function renderBuiltinModule(name: string, node: ElementNode, ctx: BuiltinRenderContext): string {
  return BUILTIN_MODULES[name]?.(node, ctx) ?? '';
}

function prop(node: ElementNode, key: string, fallback = ''): string {
  const found = node.properties.find(p => p.key === key);
  if (!found) return fallback;
  return String(found.value ?? fallback);
}

function label(node: ElementNode, fallback = ''): string {
  return node.label || prop(node, 'title', fallback);
}

function t(value: string, ctx: BuiltinRenderContext): string {
  return escapeHtml(interpolateTemplate(value, ctx.state, ctx.scope));
}

function a(value: string, ctx: BuiltinRenderContext): string {
  return escapeAttribute(interpolateTemplate(value, ctx.state, ctx.scope));
}

function renderProductsGrid(node: ElementNode, ctx: BuiltinRenderContext): string {
  const title = label(node, 'Products');
  return `<section class="k-module k-products-grid"><div class="k-module-head"><span class="k-eyebrow">Products</span><h2>${t(title, ctx)}</h2><p>${t(prop(node, 'subtitle', 'A responsive product catalog with prices, media and actions.'), ctx)}</p></div><div class="k-products">${ctx.renderChildren(node.children) || demoProducts()}</div></section>`;
}

function renderProductCard(node: ElementNode, ctx: BuiltinRenderContext): string {
  const name = label(node, 'Product');
  const price = prop(node, 'price', '€49');
  const image = prop(node, 'image', '');
  return `<article class="k-product-card">${image ? `<img src="${escapeAttribute(safeUrl(image))}" alt="${a(name, ctx)}" />` : '<div class="k-product-art"></div>'}<div><span class="k-badge">${t(prop(node, 'category', 'Featured'), ctx)}</span><h3>${t(name, ctx)}</h3><p>${t(prop(node, 'description', 'Launch-ready product block.'), ctx)}</p><strong>${t(price, ctx)}</strong><button class="k-button">${t(prop(node, 'action', 'Add to cart'), ctx)}</button></div></article>`;
}

function renderAdminShell(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<div class="k-admin-shell"><aside><h3>${t(prop(node, 'brand', 'Admin'), ctx)}</h3><a>Dashboard</a><a>Users</a><a>Orders</a><a>Billing</a><a>Settings</a></aside><main>${ctx.renderChildren(node.children) || '<section class="k-card"><h1>Admin Dashboard</h1><p>Manage users, orders, roles and reports.</p></section>'}</main></div>`;
}

function renderAdminSidebar(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<aside class="k-admin-sidebar"><h3>${t(label(node, 'Dashboard'), ctx)}</h3><a>Overview</a><a>Users</a><a>Reports</a><a>Settings</a></aside>`;
}

function renderDataTable(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Data Table'), ctx)}</h2><p>${t(prop(node, 'subtitle', 'Sortable data table module for admin and dashboards.'), ctx)}</p></div><div class="k-table-wrap"><table class="k-table"><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td>Elias</td><td>Admin</td><td><span class="k-status k-ok">Active</span></td><td><button class="k-button k-button--secondary">Edit</button></td></tr><tr><td>Maya</td><td>Editor</td><td><span class="k-status k-warn">Pending</span></td><td><button class="k-button k-button--secondary">Edit</button></td></tr></tbody></table></div></section>`;
}

function renderNewsletterSignup(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-newsletter"><div><span class="k-eyebrow">Newsletter</span><h2>${t(label(node, 'Join our newsletter'), ctx)}</h2><p>${t(prop(node, 'subtitle', 'Get product updates, templates and language improvements.'), ctx)}</p></div><form><input class="k-input" type="email" placeholder="${a(prop(node, 'placeholder', 'you@example.com'), ctx)}"><button class="k-button" type="button">${t(prop(node, 'action', 'Subscribe'), ctx)}</button></form></section>`;
}

function renderPricingSection(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><span class="k-eyebrow">Pricing</span><h2>${t(label(node, 'Simple pricing'), ctx)}</h2><p>${t(prop(node, 'subtitle', 'Choose a plan that matches your project.'), ctx)}</p></div><div class="k-pricing"><article><h3>Starter</h3><strong>€19</strong><p>For small projects.</p><button class="k-button k-button--secondary">Choose</button></article><article class="featured"><h3>Pro</h3><strong>€49</strong><p>For teams and products.</p><button class="k-button">Choose</button></article><article><h3>Business</h3><strong>€99</strong><p>For serious apps.</p><button class="k-button k-button--secondary">Choose</button></article></div></section>`;
}

function renderCheckoutSummary(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-checkout"><h2>${t(label(node, 'Order summary'), ctx)}</h2><div><span>Subtotal</span><strong>${t(prop(node, 'subtotal', '€42.00'), ctx)}</strong></div><div><span>Delivery</span><strong>${t(prop(node, 'delivery', '€3.90'), ctx)}</strong></div><div><span>Tax</span><strong>${t(prop(node, 'tax', '€8.72'), ctx)}</strong></div><hr><div><span>Total</span><strong>${t(prop(node, 'total', '€54.62'), ctx)}</strong></div><button class="k-button">${t(prop(node, 'action', 'Pay now'), ctx)}</button></section>`;
}

function renderLoginForm(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-auth"><h2>${t(label(node, 'Sign in'), ctx)}</h2><input class="k-input" type="email" placeholder="Email address"><input class="k-input" type="password" placeholder="Password"><button class="k-button">${t(prop(node, 'action', 'Sign in'), ctx)}</button><a>${t(prop(node, 'link', 'Forgot password?'), ctx)}</a></section>`;
}

function renderRegisterForm(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-auth"><h2>${t(label(node, 'Create account'), ctx)}</h2><input class="k-input" placeholder="Full name"><input class="k-input" type="email" placeholder="Email address"><input class="k-input" type="password" placeholder="Password"><button class="k-button">${t(prop(node, 'action', 'Create account'), ctx)}</button></section>`;
}

function renderStatsOverview(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-stats"><article><span>Revenue</span><strong>€48.2K</strong></article><article><span>Orders</span><strong>1.2K</strong></article><article><span>Users</span><strong>8.4K</strong></article><article><span>Growth</span><strong>+21%</strong></article></section>`;
}

function renderHeroSection(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-hero"><div><span class="k-eyebrow">${t(prop(node, 'badge', 'Kattour Module'), ctx)}</span><h1>${t(label(node, 'Build better interfaces faster.'), ctx)}</h1><p>${t(prop(node, 'subtitle', 'A product-ready hero section for modern websites and apps.'), ctx)}</p><button class="k-button">${t(prop(node, 'action', 'Get started'), ctx)}</button></div><div class="k-hero-preview"><div></div><div></div><div></div></div></section>`;
}

function renderFeatureGrid(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Powerful features'), ctx)}</h2></div><div class="k-feature-grid"><article><b>Fast</b><p>Optimized output.</p></article><article><b>Safe</b><p>Escaped by default.</p></article><article><b>AI-friendly</b><p>Predictable syntax.</p></article><article><b>Responsive</b><p>Works on all screens.</p></article></div></section>`;
}

function renderTestimonialWall(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Loved by builders'), ctx)}</h2></div><div class="k-reviews"><article>“Fast and clean.”<b>Sarah</b></article><article>“Perfect for dashboards.”<b>Jonas</b></article><article>“AI generates it correctly.”<b>Maya</b></article></div></section>`;
}

function renderFaqAccordion(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Frequently asked questions'), ctx)}</h2></div><details open><summary>What is Kattour?</summary><p>A clarity-first UI language.</p></details><details><summary>Can it build dashboards?</summary><p>Yes, using modules, components and routes.</p></details></section>`;
}

function renderContactForm(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-auth"><h2>${t(label(node, 'Contact us'), ctx)}</h2><input class="k-input" placeholder="Name"><input class="k-input" type="email" placeholder="Email"><textarea class="k-textarea" placeholder="Message"></textarea><button class="k-button">Send message</button></section>`;
}

function renderOrderTracking(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Track order'), ctx)}</h2></div><ol class="k-timeline"><li class="done">Placed</li><li class="done">Accepted</li><li class="active">Preparing</li><li>Delivered</li></ol></section>`;
}

function renderRestaurantMenu(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Restaurant menu'), ctx)}</h2></div><div class="k-menu"><article><b>Pizza Margherita</b><span>€9.90</span></article><article><b>Döner Teller</b><span>€12.50</span></article><article><b>Chicken Burger</b><span>€10.90</span></article></div></section>`;
}

function renderBookingCalendar(node: ElementNode, ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(label(node, 'Book a time'), ctx)}</h2></div><div class="k-calendar">${Array.from({ length: 28 }, (_, i) => `<span class="${[8, 14, 22].includes(i) ? 'active' : ''}">${i + 1}</span>`).join('')}</div></section>`;
}

function renderNotificationCenter(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Notifications'), ['Payment confirmed', 'New message', 'Deploy complete'], ctx); }
function renderSupportInbox(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Support inbox'), ['Urgent ticket', 'Billing question', 'Bug report'], ctx); }
function renderCrmPipeline(node: ElementNode, ctx: BuiltinRenderContext): string { return boardModule(label(node, 'CRM Pipeline'), ['Lead', 'Negotiation', 'Won'], ctx); }
function renderKanbanBoard(node: ElementNode, ctx: BuiltinRenderContext): string { return boardModule(label(node, 'Task board'), ['Todo', 'Doing', 'Done'], ctx); }
function renderInvoiceSummary(node: ElementNode, ctx: BuiltinRenderContext): string { return renderCheckoutSummary({ ...node, label: label(node, 'Invoice summary') }, ctx); }
function renderPaymentMethods(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Payment methods'), ['Stripe', 'PayPal', 'Apple Pay', 'Google Pay'], ctx); }
function renderApiKeysPanel(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'API keys'), ['Live key •••• 9201', 'Test key •••• 1844'], ctx); }
function renderTeamManagement(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Team management'), ['Elias · Owner', 'Maya · Editor', 'Jonas · Viewer'], ctx); }
function renderRoleMatrix(node: ElementNode, ctx: BuiltinRenderContext): string { return `<section class="k-module"><h2>${t(label(node, 'Role matrix'), ctx)}</h2><div class="k-role-matrix"><span></span><b>Read</b><b>Edit</b><b>Admin</b><b>Owner</b><span>✓</span><span>✓</span><span>✓</span><b>Viewer</b><span>✓</span><span></span><span></span></div></section>`; }
function renderAuditLog(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Audit log'), ['User invited', 'Role changed', 'API key revoked'], ctx); }
function renderAiChat(node: ElementNode, ctx: BuiltinRenderContext): string { return `<section class="k-ai-chat"><span>User: Build a dashboard</span><span>AI: Here is a Kattour module.</span><span>User: Add tables</span></section>`; }
function renderAiPromptBuilder(node: ElementNode, ctx: BuiltinRenderContext): string { return `<section class="k-auth"><h2>${t(label(node, 'Prompt builder'), ctx)}</h2><textarea class="k-textarea" placeholder="Describe the interface..."></textarea><button class="k-button">Generate</button></section>`; }
function renderMobileAppShowcase(node: ElementNode, ctx: BuiltinRenderContext): string { return `<section class="k-mobile-showcase"><div class="k-phone"><span></span><span></span><span></span></div><div><h2>${t(label(node, 'Mobile app showcase'), ctx)}</h2><p>Preview app screens, actions and mobile flows.</p></div></section>`; }
function renderDashboardLayout(node: ElementNode, ctx: BuiltinRenderContext): string { return renderAdminShell(node, ctx); }
function renderSearchFilters(node: ElementNode, ctx: BuiltinRenderContext): string { return `<section class="k-search"><input class="k-input" placeholder="Search..."><div><span class="k-badge">All</span><span class="k-badge">Active</span><span class="k-badge">Pending</span></div></section>`; }
function renderFileManager(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'File manager'), ['Invoices', 'Images', 'Documents', 'Exports'], ctx); }
function renderRoadmapVoting(node: ElementNode, ctx: BuiltinRenderContext): string { return listModule(label(node, 'Roadmap'), ['VSCode autocomplete · 128 votes', 'SSR · 96 votes', 'Theme editor · 72 votes'], ctx); }

function listModule(title: string, items: string[], ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(title, ctx)}</h2></div><div class="k-list-module">${items.map(item => `<article>${escapeHtml(item)}<button class="k-button k-button--secondary">Open</button></article>`).join('')}</div></section>`;
}

function boardModule(title: string, columns: string[], ctx: BuiltinRenderContext): string {
  return `<section class="k-module"><div class="k-module-head"><h2>${t(title, ctx)}</h2></div><div class="k-board">${columns.map(col => `<article><b>${escapeHtml(col)}</b><div>Example task</div><div>Follow up</div></article>`).join('')}</div></section>`;
}

function demoProducts(): string {
  return ['UI Kit', 'Dashboard Template', 'SaaS Bundle'].map((name, index) => `<article class="k-product-card"><div class="k-product-art"></div><div><span class="k-badge">Template</span><h3>${name}</h3><p>Production-ready Kattour block.</p><strong>€${[49, 79, 129][index]}</strong><button class="k-button">Buy now</button></div></article>`).join('');
}

<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- SECURITY: homeContent is an admin-only setting. -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Default Home Page -->
  <div v-else class="home-landing relative min-h-screen max-w-full overflow-hidden text-[#f5fff8]">
    <div class="home-grid pointer-events-none absolute inset-0"></div>
    <div class="home-halo home-halo-left pointer-events-none absolute"></div>
    <div class="home-halo home-halo-right pointer-events-none absolute"></div>

    <header class="home-header relative z-20 px-4 sm:px-6">
      <nav class="home-nav mx-auto flex h-20 max-w-6xl items-center justify-between gap-4">
        <router-link to="/home" class="group flex min-w-0 items-center gap-3">
          <span class="home-logo-frame flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-base font-bold leading-5 text-white">
              {{ displaySiteName }}
            </span>
            <span class="hidden text-xs font-medium text-[#a7b8ad] sm:block">
              {{ t('home.brand.tagline') }}
            </span>
          </span>
        </router-link>

        <div class="home-nav-actions flex shrink-0 items-center gap-2">
          <router-link
            to="/key-usage"
            class="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-[#d9fff0] transition hover:border-emerald-300/35 hover:bg-white/10 md:inline-flex"
          >
            <Icon name="chart" size="sm" />
            {{ t('home.nav.usageQuery') }}
          </router-link>

          <LocaleSwitcher />

          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="home-icon-button"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <button
            type="button"
            @click="toggleTheme"
            class="home-icon-button"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="home-dashboard-pill"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#b9ffd0] text-xs font-bold text-[#07351f]">
              {{ userInitial }}
            </span>
            <span class="hidden sm:inline">{{ t('home.dashboard') }}</span>
          </router-link>
          <router-link
            v-else
            to="/login"
            class="home-dashboard-pill"
          >
            <Icon name="login" size="sm" />
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <main class="relative z-10">
      <section class="px-4 pb-20 pt-14 sm:px-6 lg:pb-24 lg:pt-24">
        <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div class="min-w-0">
            <div class="home-badge mb-7 inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#3dffb4]"></span>
              <span class="truncate">{{ t('home.hero.badge', { domain: landingDomain }) }}</span>
            </div>

            <h1 class="home-hero-title text-5xl font-black leading-none text-[#d7ddd7] sm:text-6xl lg:text-7xl">
              <span class="block">{{ t('home.hero.title') }}</span>
              <span class="home-hero-accent block">{{ t('home.hero.highlight') }}</span>
            </h1>

            <p class="mt-7 max-w-xl text-base font-medium leading-8 text-[#d8e7dc] sm:text-lg">
              {{ siteSubtitle }}
            </p>

            <div
              v-if="showSignupBonus"
              class="home-signup-bonus"
              role="link"
              tabindex="0"
              :aria-label="signupBonusActionLabel"
              @click="goFromSignupBonus"
              @keydown.enter.prevent="goFromSignupBonus"
              @keydown.space.prevent="goFromSignupBonus"
            >
              <span class="home-signup-bonus-icon" aria-hidden="true">
                <Icon name="gift" size="sm" />
              </span>
              <span class="home-signup-bonus-copy">
                <span class="home-signup-bonus-kicker">注册福利</span>
                <strong>注册即送 <span class="home-signup-bonus-amount">$6</span> 额度</strong>
                <em>GPT / Codex 早鸟模型可用</em>
              </span>
              <button
                type="button"
                class="home-signup-bonus-close"
                aria-label="关闭注册福利提示"
                @click.stop="showSignupBonus = false"
              >
                <Icon name="x" size="xs" />
              </button>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <router-link
                :to="isAuthenticated ? dashboardPath : '/login'"
                class="home-primary-button"
              >
                {{ isAuthenticated ? t('home.goToDashboard') : t('home.hero.primaryCta') }}
                <Icon name="arrowRight" size="sm" :stroke-width="2" />
              </router-link>
              <router-link
                to="/key-usage"
                class="home-secondary-button"
              >
                <Icon name="chart" size="sm" />
                {{ t('home.hero.secondaryCta') }}
              </router-link>
            </div>

            <div class="mt-9 grid max-w-xl grid-cols-2 gap-3">
              <div
                v-for="stat in quickStats"
                :key="stat.label"
                class="home-mini-stat"
              >
                <Icon :name="stat.icon" size="sm" class="home-mini-stat-icon" />
                <span class="home-mini-stat-copy">
                  <strong>{{ stat.label }}</strong>
                  <em>{{ stat.value }}</em>
                </span>
              </div>
            </div>
          </div>

          <div class="flex min-w-0 lg:pl-4">
            <div class="home-pricing-panel w-full">
              <div class="home-pricing-head">
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase text-[#7dffc5]">Early Bird</p>
                  <h2 class="mt-1 text-xl font-black text-white">GPT 早鸟价格</h2>
                  <p class="mt-1 text-sm text-[#aebfb4]">按量试用，或直接选择包月高额度套餐。</p>
                </div>

                <div class="home-pricing-switch" role="tablist" aria-label="价格模式">
                  <button
                    v-for="option in pricingModeOptions"
                    :key="option.value"
                    type="button"
                    role="tab"
                    :aria-selected="pricingMode === option.value"
                    class="home-pricing-switch-button"
                    :class="{ 'home-pricing-switch-button-active': pricingMode === option.value }"
                    @click="pricingMode = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div v-if="pricingMode === 'metered'" class="home-metered-wrap">
                <div v-if="pricingLoading" class="home-pricing-loading">
                  正在读取早鸟模型价格...
                </div>
                <div v-else class="grid gap-3 sm:grid-cols-2">
                  <article
                    v-for="model in heroMeteredModels"
                    :key="model.model"
                    class="home-model-card"
                    :class="{ 'home-model-card-featured': model.featured }"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex min-w-0 items-center gap-3">
                        <span :class="model.tone" class="home-model-icon">
                          <Icon :name="model.icon" size="sm" />
                        </span>
                        <div class="min-w-0">
                          <h3 class="truncate text-base font-black text-white">{{ model.model }}</h3>
                          <p class="truncate text-xs text-[#9eafa4]">{{ model.subtitle }}</p>
                        </div>
                      </div>
                      <span v-if="model.badge" class="home-model-badge">{{ model.badge }}</span>
                    </div>

                    <div class="mt-4 space-y-2">
                      <div
                        v-for="row in model.rows"
                        :key="`${model.model}-${row.label}`"
                        class="home-price-row"
                      >
                        <span>{{ row.label }}</span>
                        <strong>{{ row.value }}</strong>
                        <em>{{ row.unit }}</em>
                      </div>
                    </div>
                  </article>
                </div>

                <div class="home-pricing-note">
                  <span>{{ pricingLoadFailed ? '接口暂不可用，当前展示预览价格。' : '展示核心早鸟模型，更多模型进入控制台查看。' }}</span>
                  <router-link :to="isAuthenticated ? dashboardPath : '/login'">
                    {{ isAuthenticated ? '查看全部' : '登录查看' }}
                    <Icon name="arrowRight" size="xs" :stroke-width="2" />
                  </router-link>
                </div>
              </div>

              <div v-else class="home-monthly-list">
                <article
                  v-for="plan in monthlyPreviewPlans"
                  :key="plan.name"
                  class="home-monthly-card"
                  :class="{ 'home-monthly-card-featured': plan.recommended }"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="home-model-badge">{{ plan.badge }}</span>
                        <span class="text-xs font-bold text-[#7dffc5]">{{ plan.level }}</span>
                      </div>
                      <h3 class="mt-3 text-2xl font-black text-white">{{ plan.name }}</h3>
                      <p class="mt-2 text-xs leading-6 text-[#d8d0c8]">
                        {{ plan.description }}
                      </p>
                    </div>

                    <div class="home-monthly-price">
                      <strong>早鸟价</strong>
                      <span>{{ plan.price }}</span>
                      <em>/月</em>
                      <del>原价 {{ plan.originalPrice }}</del>
                    </div>
                  </div>

                  <dl class="home-monthly-quota-grid">
                    <div
                      v-for="benefit in plan.benefits"
                      :key="`${plan.name}-${benefit}`"
                      class="home-monthly-benefit"
                    >
                      <Icon name="check" size="xs" :stroke-width="2.5" />
                      <span>{{ benefit }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-[#9eafa4]">每日限制</dt>
                      <dd class="font-bold text-white">{{ plan.dailyLimit }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-[#9eafa4]">每周限制</dt>
                      <dd class="font-bold text-white">{{ plan.weeklyLimit }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <dt class="text-[#9eafa4]">每月限制</dt>
                      <dd class="font-bold text-white">{{ plan.monthlyLimit }}</dd>
                    </div>
                  </dl>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="home-section px-4 py-16 sm:px-6 lg:py-20">
        <div class="mx-auto max-w-7xl">
          <div class="mx-auto max-w-2xl text-center">
            <p class="home-section-kicker">价格优势</p>
            <h2 class="home-section-title mt-4">早鸟价，对比看得见</h2>
            <p class="mt-4 text-sm leading-7 text-[#b9c8bd]">
              左侧为 OpenAI 当前官方公开价格，单位 USD；右侧为 CodexHub 早鸟价格，单位 RMB。
            </p>
          </div>

          <div class="home-price-compare-board mx-auto mt-10 max-w-7xl">
            <div class="home-price-compare-hero">
              <div class="min-w-0">
                <span class="home-price-compare-label">OpenAI USD vs Early Bird RMB</span>
                <h3 class="mt-3 text-2xl font-black text-white sm:text-3xl">
                  两张表并排看，官方价与早鸟价一眼分明
                </h3>
                <p class="mt-3 max-w-2xl text-sm leading-7 text-[#b9c8bd]">
                  OpenAI 官方价来自本页可配置价格表，CodexHub 早鸟价读取当前公开接口；不再展示同行价、相差倍数和同行标准价字段。
                </p>
              </div>
            </div>

            <div v-if="pricingLoading" class="home-pricing-loading mt-5">
              正在读取早鸟价格...
            </div>
            <div v-else class="home-price-boards">
              <article class="home-price-board home-price-board-official">
                <div class="home-price-board-head">
                  <div class="home-price-board-topline">
                    <span class="home-price-board-badge">OpenAI Official</span>
                    <span class="home-price-board-currency">USD</span>
                  </div>
                  <h3 class="home-price-board-title">OpenAI 当前官方价格</h3>
                  <p class="home-price-board-note">左侧表格为美元价格，可在本页官方价配置中维护。</p>
                </div>
                <div class="home-price-table-shell">
                  <table class="home-price-split-table">
                    <thead>
                      <tr>
                        <th>模型</th>
                        <th>计费项</th>
                        <th>官方价</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template
                        v-for="row in priceComparisonRows"
                        :key="`official-${row.model}`"
                      >
                        <tr
                          v-for="(item, metricIndex) in row.metrics"
                          :key="`official-${item.id}`"
                        >
                          <td
                            v-if="metricIndex === 0"
                            class="home-price-model-cell"
                            :rowspan="row.metrics.length"
                          >
                            <span class="home-price-model-name">{{ row.modelLabel }}</span>
                            <small>{{ row.metrics.length }} 项</small>
                          </td>
                          <td class="home-price-metric-cell">
                            <span class="home-price-metric">{{ item.metricLabel }}</span>
                            <small>{{ item.unit }}</small>
                          </td>
                          <td class="home-price-value-cell">
                            <span class="home-price-price home-price-price-usd">
                              {{ formatReferencePrice(item.officialPrice, openAIOfficialPricingJson.currency) }}
                            </span>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </article>

              <div class="home-price-vs" aria-label="OpenAI 官方价对比 CodexHub 早鸟价">
                <span class="home-price-vs-node">
                  <strong>VS</strong>
                  <small>USD / RMB</small>
                </span>
              </div>

              <article class="home-price-board home-price-board-early">
                <div class="home-price-board-head">
                  <div class="home-price-board-topline">
                    <span class="home-price-board-badge">CodexHub Early Bird</span>
                    <span class="home-price-board-currency">RMB</span>
                  </div>
                  <h3 class="home-price-board-title">CodexHub 早鸟价格</h3>
                  <p class="home-price-board-note">右侧表格为人民币价格，也就是当前对外展示的早鸟价。</p>
                </div>
                <div class="home-price-table-shell">
                  <table class="home-price-split-table">
                    <thead>
                      <tr>
                        <th>模型</th>
                        <th>计费项</th>
                        <th>早鸟价</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template
                        v-for="row in priceComparisonRows"
                        :key="`early-${row.model}`"
                      >
                        <tr
                          v-for="(item, metricIndex) in row.metrics"
                          :key="`early-${item.id}`"
                        >
                          <td
                            v-if="metricIndex === 0"
                            class="home-price-model-cell"
                            :rowspan="row.metrics.length"
                          >
                            <span class="home-price-model-name">{{ row.modelLabel }}</span>
                            <small>{{ row.metrics.length }} 项</small>
                          </td>
                          <td class="home-price-metric-cell">
                            <span class="home-price-metric">{{ item.metricLabel }}</span>
                            <small>{{ item.unit }}</small>
                          </td>
                          <td class="home-price-value-cell">
                            <span class="home-price-price home-price-price-rmb">
                              {{ formatComparisonOwnPrice(item.ownPrice) }}
                            </span>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="home-section px-4 py-16 sm:px-6 lg:py-20">
        <div class="mx-auto max-w-6xl">
          <div class="mx-auto max-w-2xl text-center">
            <p class="home-section-kicker">智能路由</p>
            <h2 class="home-section-title mt-4">命中更便宜的路径，把成本压下来</h2>
            <p class="mt-4 text-sm leading-7 text-[#b9c8bd]">
              入口层内置大模型路由命中算法，结合模型能力矩阵、上下文长度、缓存状态与通道健康度做动态决策，减少重复 token 和无效高价请求。
            </p>
          </div>

          <div class="home-routing-board mx-auto mt-10 max-w-6xl">
            <div class="home-routing-main">
              <span class="home-price-compare-label">LLM Routing Hit Engine</span>
              <h3 class="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                请求先打分，再命中缓存，最后按成本最优路径分发
              </h3>
              <p class="mt-4 text-sm leading-7 text-[#b9c8bd]">
                对每次调用生成语义指纹与上下文特征，优先复用可命中的 Prefix Cache / 语义缓存；当缓存无法覆盖时，再按价格、延迟、成功率和额度余量综合排序，把同等质量的请求导向更低成本链路。
              </p>

              <div class="mt-7 grid gap-3 sm:grid-cols-2">
                <div
                  v-for="item in routingStats"
                  :key="item.label"
                  class="home-routing-stat"
                >
                  <Icon :name="item.icon" size="md" />
                  <div>
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </div>

              <p class="home-routing-note mt-7">
                热请求优先走缓存与低价通道，长上下文和高价值任务才进入高能力模型，避免“所有请求都按最贵模型结算”。
              </p>
            </div>

            <div class="home-routing-flow">
              <article
                v-for="step in routingFlowSteps"
                :key="step.title"
                class="home-routing-step"
              >
                <span>{{ step.index }}</span>
                <div>
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="home-section px-4 py-16 sm:px-6 lg:py-20">
        <div class="mx-auto max-w-6xl">
          <div class="home-contact-board">
            <div class="home-contact-main">
              <p class="home-section-kicker">技术交流</p>
              <h2 class="home-section-title mt-4">接入评估与方案反馈</h2>
              <p class="mt-4 max-w-2xl text-sm leading-7 text-[#b9c8bd]">
                面向 Codex / GPT 工作流的 API 中转接入、模型路由、额度策略和成本治理问题，都可以直接沟通。也欢迎交流真实开发场景里的稳定性、缓存命中和团队用量管理经验。
              </p>

              <div class="home-contact-card mt-8">
                <div>
                  <span>微信联系</span>
                  <strong>{{ contactWechat }}</strong>
                </div>
                <button type="button" class="home-contact-copy-button" @click="copyContactWechat">
                  <Icon name="copy" size="sm" />
                  {{ contactCopied ? '已复制' : '复制' }}
                </button>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="item in contactTopics"
                  :key="item"
                  class="home-contact-topic"
                >
                  {{ item }}
                </span>
              </div>
            </div>

            <div class="home-contact-panel">
              <Icon name="chat" size="lg" class="text-[#83ffba]" />
              <h3>从接入验证到长期稳定运行，按实际负载一起梳理方案</h3>
              <p>
                如果你正在评估 Codex 中转、包月额度、模型价格或团队 API Key 管理，可以把当前调用方式、模型需求和预估消耗发过来，我会结合路由策略、缓存收益和预算边界给出接入建议。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="px-4 pb-16 pt-8 sm:px-6 lg:pb-20">
        <div class="home-final-cta mx-auto max-w-6xl">
          <p class="text-sm font-black uppercase text-[#07351f]">Ready for Codex Workflow</p>
          <h2 class="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight text-[#062516] sm:text-4xl">
            将 GPT-5.5 / GPT-5.4 接入你的 Codex 开发流程
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#17412b]">
            创建 API Key、配置 Base URL 和模型路由策略后，即可统一管理用量、成本、缓存命中和团队访问权限。
          </p>

          <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <router-link
              :to="isAuthenticated ? dashboardPath : '/login'"
              class="home-final-cta-button"
            >
              {{ isAuthenticated ? t('home.goToDashboard') : '进入控制台' }}
              <Icon name="arrowRight" size="sm" :stroke-width="2" />
            </router-link>
            <router-link to="/key-usage" class="home-final-cta-secondary">
              <Icon name="chart" size="sm" />
              查询 API Key 用量
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p class="text-sm w-full text-center text-[#91a99b]">
          &copy; {{ currentYear }} {{ displaySiteName }}. {{ t('home.footer.allRightsReserved') }}
        </p>
        <div class="flex items-center gap-4">
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-[#91a99b] transition hover:text-white"
          >
            {{ t('home.docs') }}
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import {
  getPublicGPTEarlyBirdModels,
  type PublicGPTEarlyBirdModelPricing
} from '@/api/channels'
import { useClipboard } from '@/composables/useClipboard'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

type IconName = InstanceType<typeof Icon>['$props']['name']
type PricingMode = 'metered' | 'monthly'
type PriceCurrency = 'USD' | 'CNY'
type PriceField =
  | 'input_price'
  | 'output_price'
  | 'cache_read_price'
  | 'image_output_price'
  | 'per_request_price'

interface StatItem {
  icon: IconName
  label: string
  value: string
}

interface RoutingStatItem {
  icon: IconName
  label: string
  value: string
}

interface RoutingFlowStep {
  index: string
  title: string
  description: string
}

interface MeteredPriceRow {
  label: string
  value: string
  unit: string
}

interface MeteredDisplayModel {
  model: string
  subtitle: string
  icon: IconName
  tone: string
  rows: MeteredPriceRow[]
  badge?: string
  featured?: boolean
}

interface MonthlyPreviewPlan {
  name: string
  level: string
  badge: string
  price: string
  originalPrice: string
  description: string
  benefits: string[]
  dailyLimit: string
  weeklyLimit: string
  monthlyLimit: string
  recommended?: boolean
}

interface PriceComparisonBenchmark {
  id: string
  model: string
  modelLabel: string
  metric: PriceField
  metricLabel: string
  unit: string
  officialPrice: number | null
}

interface PriceComparisonCatalog {
  currency: PriceCurrency
  models: Record<string, Partial<Record<PriceField, number>>>
}

interface PriceComparisonMetricRow extends PriceComparisonBenchmark {
  ownPrice: number | null
}

interface PriceComparisonRow {
  model: string
  modelLabel: string
  metrics: PriceComparisonMetricRow[]
}

const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { copied: contactCopied, copyToClipboard } = useClipboard()

const configuredSiteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || '')
const displaySiteName = computed(() => {
  const name = configuredSiteName.value.trim()
  if (!name || name.toLowerCase() === 'sub2api') return 'CodexHub'
  return name
})
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const siteSubtitle = computed(() => {
  const subtitle = (appStore.cachedPublicSettings?.site_subtitle || '').trim()
  const defaultSubtitles = new Set([
    'AI API Gateway Platform',
    'Subscription to API Conversion Platform'
  ])
  if (!subtitle || defaultSubtitles.has(subtitle)) return t('home.hero.subtitle')
  return subtitle
})
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')

const landingDomain = computed(() => {
  const host = window.location.hostname
  if (!host || host === 'localhost' || host === '127.0.0.1') return 'codex-app.cn'
  return host
})

const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

const isDark = ref(document.documentElement.classList.contains('dark'))
const pricingMode = ref<PricingMode>('metered')
const pricingLoading = ref(false)
const pricingLoadFailed = ref(false)
const showSignupBonus = ref(true)
const earlyBirdModels = ref<PublicGPTEarlyBirdModelPricing[]>([])

const contactWechat = 'cqcjjjava'
const contactTopics = ['接入评估', '稳定性排查', '模型路由', '额度方案', '技术交流']

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))
const signupBonusActionLabel = computed(() =>
  isAuthenticated.value ? '进入控制台查看早鸟价格' : '登录领取注册福利'
)
const userInitial = computed(() => {
  const user = authStore.user
  if (!user || !user.email) return ''
  return user.email.charAt(0).toUpperCase()
})

function goFromSignupBonus() {
  router.push(isAuthenticated.value ? dashboardPath.value : '/login')
}

const currentYear = computed(() => new Date().getFullYear())

const pricingModeOptions: Array<{ value: PricingMode; label: string }> = [
  { value: 'metered', label: '按量早鸟价' },
  { value: 'monthly', label: '包月套餐' }
]

const fallbackEarlyBirdModels: PublicGPTEarlyBirdModelPricing[] = [
  {
    model: 'gpt-5.5',
    platform: 'openai',
    billing_mode: 'token',
    input_price: 5,
    output_price: 30,
    cache_write_price: null,
    cache_read_price: 0.5,
    image_output_price: null,
    per_request_price: null
  },
  {
    model: 'gpt-5.4',
    platform: 'openai',
    billing_mode: 'token',
    input_price: 2.5,
    output_price: 15,
    cache_write_price: null,
    cache_read_price: 0.25,
    image_output_price: null,
    per_request_price: null
  },
  {
    model: 'gpt-5.3-codex',
    platform: 'openai',
    billing_mode: 'token',
    input_price: 1.75,
    output_price: 14,
    cache_write_price: null,
    cache_read_price: 0.175,
    image_output_price: null,
    per_request_price: null
  },
  {
    model: 'gpt-image-2',
    platform: 'openai',
    billing_mode: 'image',
    input_price: null,
    output_price: null,
    cache_write_price: null,
    cache_read_price: null,
    image_output_price: null,
    per_request_price: 0.01
  }
]

const preferredHeroModels = ['gpt-5.5', 'gpt-5.4', 'gpt-5.3-codex', 'gpt-image-2']

const openAIOfficialPricingJson: PriceComparisonCatalog = {
  currency: 'USD',
  models: {
    'gpt-5.5': {
      input_price: 5,
      output_price: 30,
      cache_read_price: 0.5
    },
    'gpt-5.4': {
      input_price: 2.5,
      output_price: 15,
      cache_read_price: 0.25
    },
    'gpt-5.3-codex': {
      input_price: 1.75,
      output_price: 14,
      cache_read_price: 0.175
    },
    'gpt-image-2': {
      input_price: 5,
      output_price: 30,
      cache_read_price: 1.25,
      image_output_price: 30,
      per_request_price: 0.08
    }
  }
}

const priceComparisonModelsJson: Array<{
  model: string
  label: string
  metrics: Array<{ field: PriceField; label: string; unit: string }>
}> = [
  {
    model: 'gpt-5.5',
    label: 'GPT-5.5',
    metrics: [
      { field: 'input_price', label: '输入', unit: '/ MTok' },
      { field: 'output_price', label: '输出', unit: '/ MTok' },
      { field: 'cache_read_price', label: '缓存读', unit: '/ MTok' }
    ]
  },
  {
    model: 'gpt-5.4',
    label: 'GPT-5.4',
    metrics: [
      { field: 'input_price', label: '输入', unit: '/ MTok' },
      { field: 'output_price', label: '输出', unit: '/ MTok' },
      { field: 'cache_read_price', label: '缓存读', unit: '/ MTok' }
    ]
  },
  {
    model: 'gpt-5.3-codex',
    label: 'GPT-5.3 Codex',
    metrics: [
      { field: 'input_price', label: '输入', unit: '/ MTok' },
      { field: 'output_price', label: '输出', unit: '/ MTok' },
      { field: 'cache_read_price', label: '缓存读', unit: '/ MTok' }
    ]
  },
  {
    model: 'gpt-image-2',
    label: 'GPT Image 2',
    metrics: [
      { field: 'per_request_price', label: '单张图片', unit: '/ 张' }
    ]
  }
]

const priceComparisonItems: Array<Omit<PriceComparisonBenchmark, 'officialPrice'>> =
  priceComparisonModelsJson.flatMap((model) =>
    model.metrics.map((metric) => ({
      id: `${model.model}-${metric.field}`,
      model: model.model,
      modelLabel: model.label,
      metric: metric.field,
      metricLabel: metric.label,
      unit: metric.unit
    }))
  )

const priceComparisonBenchmarks: PriceComparisonBenchmark[] = priceComparisonItems.map((item) => ({
  ...item,
  officialPrice: openAIOfficialPricingJson.models[item.model]?.[item.metric] ?? null
}))

const effectiveEarlyBirdModels = computed(() =>
  earlyBirdModels.value.length > 0 ? earlyBirdModels.value : fallbackEarlyBirdModels
)

const heroMeteredModels = computed<MeteredDisplayModel[]>(() => {
  const normalizedPreferred = new Set(preferredHeroModels)
  const preferred = preferredHeroModels
    .map((modelName) => effectiveEarlyBirdModels.value.find((item) => normalizeModelName(item.model) === modelName))
    .filter((item): item is PublicGPTEarlyBirdModelPricing => Boolean(item))
  const remaining = effectiveEarlyBirdModels.value.filter(
    (item) => !normalizedPreferred.has(normalizeModelName(item.model))
  )
  return [...preferred, ...remaining].slice(0, 6).map(toMeteredDisplayModel)
})

const priceComparisonMetricRows = computed<PriceComparisonMetricRow[]>(() =>
  priceComparisonBenchmarks.map((benchmark) => {
    const model = earlyBirdModels.value.find(
      (item) => normalizeModelName(item.model) === benchmark.model
    )
    const ownPrice = readModelPrice(model, benchmark.metric)

    return {
      ...benchmark,
      ownPrice
    }
  })
)

const priceComparisonRows = computed<PriceComparisonRow[]>(() =>
  priceComparisonModelsJson
    .map((model) => ({
      model: model.model,
      modelLabel: model.label,
      metrics: priceComparisonMetricRows.value.filter((row) => row.model === model.model)
    }))
    .filter((row) => row.metrics.length > 0)
)

const monthlyPreviewPlans: MonthlyPreviewPlan[] = [
  {
    name: 'Pro 5X',
    level: 'Starter',
    badge: '推荐',
    price: '¥380',
    originalPrice: '¥560',
    description: '适合个人开发者高频使用，支持 GPT-5.5 与 GPT-5.4 模型稳定调用。',
    benefits: ['赠送早鸟试用额度', '独立 API Key 与高速通道'],
    dailyLimit: '$60 / 日',
    weeklyLimit: '$360 / 周',
    monthlyLimit: '$1440 / 月',
    recommended: true
  },
  {
    name: 'Pro 20X',
    level: 'Team',
    badge: '顶级',
    price: '¥1700',
    originalPrice: '¥1800',
    description: '适合小团队和重度工作流，额度更高，适合持续 Codex 开发场景。',
    benefits: ['享受Pro5X所有权益', '更高额度池'],
    dailyLimit: '$240 / 日',
    weeklyLimit: '$1440 / 周',
    monthlyLimit: '$5760 / 月'
  }
]

const quickStats = computed<StatItem[]>(() => [
  { icon: 'globe', label: '国内直连', value: '无需 VPN' },
  { icon: 'gift', label: '早鸟试用', value: '按量/包月送额度' },
  { icon: 'dollar', label: '包月套餐', value: '¥380 起' },
  { icon: 'shield', label: '数据安全', value: '不转售用户数据' }
])

const routingStats: RoutingStatItem[] = [
  {
    icon: 'cpu',
    label: '能力矩阵路由',
    value: '模型能力 / 价格 / 延迟综合打分'
  },
  {
    icon: 'bolt',
    label: '高命中缓存层',
    value: 'Prefix Cache + 语义指纹复用'
  },
  {
    icon: 'database',
    label: '上下文复用',
    value: '热请求减少重复 token 消耗'
  },
  {
    icon: 'chart',
    label: '成本感知分发',
    value: '同质量优先选择低成本链路'
  }
]

const routingFlowSteps: RoutingFlowStep[] = [
  {
    index: '01',
    title: '请求画像',
    description: '提取模型、上下文长度、任务类型、缓存键和额度状态，形成路由特征。'
  },
  {
    index: '02',
    title: '缓存命中',
    description: '先查 Prefix Cache、语义缓存和可复用上下文，命中后直接降低 token 成本。'
  },
  {
    index: '03',
    title: '成本打分',
    description: '按价格、延迟、成功率、剩余额度和模型能力做加权排序。'
  },
  {
    index: '04',
    title: '弹性回退',
    description: '通道异常或成本过高时自动切换可用路径，减少失败重试和高价兜底。'
  }
]

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function copyContactWechat() {
  void copyToClipboard(contactWechat, '微信号已复制')
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

function normalizeModelName(model: string) {
  return model.trim().toLowerCase()
}

function formatUsd(value: number | null | undefined) {
  if (value == null) return '-'
  const fractionDigits = Math.abs(value) < 1 ? 4 : Math.abs(value) < 10 ? 2 : 0
  const formatted = value.toFixed(fractionDigits)
  return `$${fractionDigits === 0 ? formatted : formatted.replace(/\.?0+$/, '')}`
}

function formatCny(value: number | null | undefined) {
  if (value == null) return '-'
  const abs = Math.abs(value)
  const fractionDigits = abs < 1 ? 4 : Number.isInteger(value) ? 0 : abs < 10 ? 2 : 1
  const formatted = value.toFixed(fractionDigits)
  return `¥${fractionDigits === 0 ? formatted : formatted.replace(/\.?0+$/, '')}`
}

function formatReferencePrice(value: number | null | undefined, currency: PriceCurrency) {
  if (value == null) return '-'
  return currency === 'USD' ? formatUsd(value) : formatCny(value)
}

function formatComparisonOwnPrice(value: number | null | undefined) {
  if (value == null) return pricingLoadFailed.value ? '接口异常' : '待接口'
  return formatCny(value)
}

function readModelPrice(model: PublicGPTEarlyBirdModelPricing | undefined, field: PriceField) {
  if (!model) return null
  if (field === 'per_request_price' && isImageModel(model)) {
    const value = model.per_request_price ?? model.image_output_price
    return typeof value === 'number' ? value : null
  }
  const value = model[field]
  return typeof value === 'number' ? value : null
}

function isImageModel(model: PublicGPTEarlyBirdModelPricing) {
  return model.billing_mode === 'image' || normalizeModelName(model.model).includes('image')
}

function getModelSubtitle(model: PublicGPTEarlyBirdModelPricing) {
  if (isImageModel(model)) return '图像生成模型'
  if (normalizeModelName(model.model).includes('codex')) return '专为代码生成优化'
  if (normalizeModelName(model.model).includes('5.5')) return '最新旗舰模型'
  if (normalizeModelName(model.model).includes('5.4')) return '稳定通用模型'
  return `${model.platform} 模型`
}

function getModelIcon(model: PublicGPTEarlyBirdModelPricing): IconName {
  if (isImageModel(model)) return 'sparkles'
  if (normalizeModelName(model.model).includes('codex')) return 'terminal'
  return 'cpu'
}

function getModelTone(model: PublicGPTEarlyBirdModelPricing) {
  if (isImageModel(model)) return 'bg-cyan-400/15 text-cyan-200'
  if (normalizeModelName(model.model).includes('5.5')) return 'bg-lime-400/15 text-lime-200'
  if (normalizeModelName(model.model).includes('codex')) return 'bg-violet-400/15 text-violet-200'
  return 'bg-emerald-400/15 text-emerald-200'
}

function getModelBadge(model: PublicGPTEarlyBirdModelPricing) {
  if (normalizeModelName(model.model).includes('5.5')) return '旗舰'
  if (isImageModel(model)) return 'Image'
  return ''
}

function getPriceRows(model: PublicGPTEarlyBirdModelPricing): MeteredPriceRow[] {
  if (isImageModel(model)) {
    const imagePrice = model.per_request_price ?? model.image_output_price
    return [
      {
        label: '单张图片',
        value: formatCny(imagePrice),
        unit: '/ 张'
      }
    ].filter((row) => row.value !== '-')
  }

  if (model.per_request_price != null && model.billing_mode !== 'token') {
    return [
      {
        label: '单次',
        value: formatCny(model.per_request_price),
        unit: '/ 次'
      }
    ]
  }

  return [
    { label: '输入', value: formatCny(model.input_price), unit: '/ MTok' },
    { label: '输出', value: formatCny(model.output_price), unit: '/ MTok' },
    { label: '缓存读', value: formatCny(model.cache_read_price), unit: '/ MTok' }
  ].filter((row) => row.value !== '-')
}

function toMeteredDisplayModel(model: PublicGPTEarlyBirdModelPricing): MeteredDisplayModel {
  return {
    model: model.model,
    subtitle: getModelSubtitle(model),
    icon: getModelIcon(model),
    tone: getModelTone(model),
    rows: getPriceRows(model),
    badge: getModelBadge(model),
    featured: normalizeModelName(model.model).includes('5.5')
  }
}

async function loadEarlyBirdModels() {
  pricingLoading.value = true
  pricingLoadFailed.value = false
  try {
    earlyBirdModels.value = await getPublicGPTEarlyBirdModels()
  } catch {
    pricingLoadFailed.value = true
    earlyBirdModels.value = []
  } finally {
    pricingLoading.value = false
  }
}

onMounted(() => {
  initTheme()
  authStore.checkAuth()
  loadEarlyBirdModels()

  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.home-landing {
  isolation: isolate;
  background:
    radial-gradient(circle at 9% 13%, rgba(71, 157, 113, 0.42), transparent 24rem),
    radial-gradient(circle at 88% 11%, rgba(121, 181, 52, 0.16), transparent 22rem),
    linear-gradient(180deg, #08140f 0%, #06110c 42%, #04100b 100%);
}

.home-grid {
  background-image:
    linear-gradient(rgba(132, 255, 188, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(132, 255, 188, 0.06) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.56) 62%, rgba(0, 0, 0, 0.2));
}

.home-halo {
  width: 22rem;
  height: 22rem;
  border-radius: 9999px;
  filter: blur(72px);
  opacity: 0.32;
}

.home-halo-left {
  left: -10rem;
  top: 4rem;
  background: #69e7a4;
}

.home-halo-right {
  right: -8rem;
  top: 10rem;
  background: #9be35c;
}

.home-header {
  background: linear-gradient(180deg, rgba(5, 16, 11, 0.84), rgba(5, 16, 11, 0.48));
  backdrop-filter: blur(18px);
}

.home-logo-frame {
  border: 1px solid rgba(105, 255, 183, 0.22);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

.home-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  color: #d9fff0;
  background: rgba(255, 255, 255, 0.05);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.home-icon-button:hover {
  border-color: rgba(125, 255, 197, 0.36);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.home-dashboard-pill,
.home-primary-button,
.home-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 800;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.home-dashboard-pill {
  padding: 0.45rem 0.85rem;
  color: #07351f;
  background: linear-gradient(135deg, #83ffba, #d7ff95);
}

.home-primary-button {
  padding: 0.85rem 1.25rem;
  color: #07351f;
  background: linear-gradient(135deg, #3dd79f, #91f2b0);
  box-shadow: 0 16px 48px rgba(61, 215, 159, 0.22);
}

.home-secondary-button {
  padding: 0.85rem 1.25rem;
  color: #d9fff0;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.05);
}

.home-dashboard-pill:hover,
.home-primary-button:hover,
.home-secondary-button:hover {
  transform: translateY(-2px);
}

.home-badge {
  color: #7dffc5;
  border: 1px solid rgba(60, 255, 180, 0.22);
  background: rgba(0, 22, 36, 0.74);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.home-hero-title {
  letter-spacing: 0;
  text-wrap: balance;
  text-shadow: 0 18px 54px rgba(0, 0, 0, 0.34);
}

.home-hero-accent {
  margin-top: 0.08em;
  background: linear-gradient(90deg, #ebfff1 0%, #c7ff8a 42%, #1fd18a 82%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-signup-bonus {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: min(31rem, 100%);
  align-items: center;
  justify-content: flex-start;
  gap: 0.72rem;
  overflow: hidden;
  margin-top: 1.35rem;
  border: 1px solid rgba(156, 255, 201, 0.24);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(4, 34, 23, 0.96), rgba(18, 20, 15, 0.94)),
    rgba(4, 14, 10, 0.94);
  padding: 0.5rem 0.5rem 0.5rem 0.72rem;
  box-shadow:
    0 0 0 1px rgba(125, 255, 197, 0.08),
    0 14px 38px rgba(0, 0, 0, 0.32),
    0 0 26px rgba(72, 255, 160, 0.1);
  cursor: pointer;
  pointer-events: auto;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
  backdrop-filter: blur(16px);
}

.home-signup-bonus:hover,
.home-signup-bonus:focus-visible {
  border-color: rgba(217, 255, 111, 0.42);
  box-shadow:
    0 0 0 1px rgba(125, 255, 197, 0.12),
    0 16px 44px rgba(0, 0, 0, 0.38),
    0 0 34px rgba(217, 255, 111, 0.16);
  outline: none;
  transform: translateY(-1px);
}

.home-signup-bonus::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.18rem;
  background: linear-gradient(180deg, #b8ff79, #54f1aa);
  content: "";
}

.home-signup-bonus::after {
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(131, 255, 186, 0.28), transparent);
  content: "";
}

.home-signup-bonus-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 2.12rem;
  height: 2.12rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(184, 255, 121, 0.36);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(184, 255, 121, 0.18), rgba(84, 241, 170, 0.1)),
    rgba(156, 255, 201, 0.1);
  color: #d9ff6f;
  animation: home-gift-float 2.6s ease-in-out infinite;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 18px rgba(217, 255, 111, 0.16);
}

.home-signup-bonus-icon::after {
  position: absolute;
  inset: -30% auto -30% -55%;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.52), transparent);
  content: "";
  transform: rotate(18deg);
  animation: home-gift-shine 2.8s ease-in-out infinite;
}

.home-signup-bonus-icon svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 8px rgba(217, 255, 111, 0.34));
  animation: home-gift-pop 1.9s ease-in-out infinite;
}

.home-signup-bonus-copy {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 0.12rem 0.48rem;
}

.home-signup-bonus-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  min-height: 1.22rem;
  border: 1px solid rgba(156, 255, 201, 0.18);
  border-radius: 9999px;
  background: rgba(84, 241, 170, 0.1);
  color: #c9ffdc;
  padding: 0 0.42rem;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(156, 255, 201, 0.22);
  white-space: nowrap;
}

.home-signup-bonus strong {
  position: relative;
  z-index: 1;
  color: #f5fff8;
  font-size: 0.98rem;
  font-weight: 950;
  line-height: 1.1;
  white-space: nowrap;
}

.home-signup-bonus-amount {
  color: #d9ff6f;
  font-size: 1.36em;
  text-shadow:
    0 0 14px rgba(217, 255, 111, 0.28),
    0 0 22px rgba(125, 255, 197, 0.16);
}

.home-signup-bonus em {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  color: #d7f7e1;
  font-size: 0.76rem;
  font-style: normal;
  font-weight: 900;
  line-height: 1.35;
  text-shadow: 0 0 12px rgba(125, 255, 197, 0.16);
  white-space: nowrap;
}

.home-signup-bonus-close {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.055);
  color: #b9c8bd;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.home-signup-bonus-close:hover {
  border-color: rgba(156, 255, 201, 0.24);
  background: rgba(156, 255, 201, 0.12);
  color: #f5fff8;
}

@media (max-width: 640px) {
  .home-signup-bonus {
    width: 100%;
    gap: 0.55rem;
    padding: 0.55rem;
  }

  .home-signup-bonus:hover,
  .home-signup-bonus:focus-visible {
    transform: translateY(-1px);
  }

  .home-signup-bonus-copy {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }

  .home-signup-bonus strong {
    font-size: 0.98rem;
  }

  .home-signup-bonus em {
    width: 100%;
    white-space: normal;
  }
}

@keyframes home-gift-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-0.16rem);
  }
}

@keyframes home-gift-pop {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }

  45% {
    transform: scale(1.08) rotate(-4deg);
  }

  70% {
    transform: scale(1.02) rotate(3deg);
  }
}

@keyframes home-gift-shine {
  0%,
  46% {
    left: -55%;
  }

  74%,
  100% {
    left: 112%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-signup-bonus-icon,
  .home-signup-bonus-icon::after,
  .home-signup-bonus-icon svg {
    animation: none;
  }
}

.home-mini-stat,
.home-provider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(33, 26, 22, 0.72);
  color: #d9fff0;
}

.home-mini-stat {
  align-items: center;
  min-height: 3.65rem;
  padding: 0.7rem 0.85rem;
}

.home-mini-stat-icon {
  margin-top: 0.15rem;
  flex-shrink: 0;
  color: #86ffd5;
}

.home-mini-stat-copy {
  display: grid;
  min-width: 0;
  gap: 0.25rem;
}

.home-mini-stat-copy strong {
  color: #f5fff8;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.15;
  white-space: nowrap;
}

.home-mini-stat-copy em {
  color: #a9c8b6;
  font-size: 0.74rem;
  font-style: normal;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
}

.home-provider-row {
  min-height: 3.5rem;
  padding: 0.75rem;
}

.home-pricing-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(125, 255, 197, 0.16);
  border-radius: 8px;
  background:
    radial-gradient(circle at 92% 8%, rgba(61, 215, 159, 0.14), transparent 14rem),
    rgba(31, 22, 19, 0.95);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.36), 0 0 0 1px rgba(134, 255, 213, 0.06);
  padding: 0.875rem;
}

.home-pricing-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.75rem;
}

.home-pricing-switch {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.22);
  padding: 0.25rem;
}

.home-pricing-switch-button {
  min-height: 2rem;
  border-radius: 9999px;
  padding: 0 0.8rem;
  color: #aebfb4;
  font-size: 0.78rem;
  font-weight: 900;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.home-pricing-switch-button-active {
  background: linear-gradient(135deg, #3dd79f, #b9ff9b);
  color: #062516;
}

.home-metered-wrap {
  display: flex;
  flex-direction: column;
  padding-top: 0.875rem;
}

.home-pricing-loading {
  display: flex;
  min-height: 17rem;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  color: #aebfb4;
  font-size: 0.9rem;
  font-weight: 700;
}

.home-model-card,
.home-monthly-card {
  min-width: 0;
  border: 1px solid rgba(125, 255, 197, 0.12);
  border-radius: 8px;
  background: rgba(7, 20, 14, 0.48);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.home-model-card {
  display: flex;
  min-height: 11rem;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.95rem;
}

.home-model-card-featured,
.home-monthly-card-featured {
  border-color: rgba(125, 255, 197, 0.34);
  background:
    linear-gradient(135deg, rgba(61, 215, 159, 0.14), transparent 58%),
    rgba(7, 20, 14, 0.58);
}

.home-model-icon {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.home-model-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.45rem;
  border-radius: 9999px;
  background: rgba(61, 215, 159, 0.16);
  padding: 0 0.6rem;
  color: #7dffc5;
  font-size: 0.68rem;
  font-weight: 900;
}

.home-price-row {
  display: grid;
  grid-template-columns: 3.1rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.4rem;
  min-height: 1.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.035);
  padding: 0 0.55rem;
}

.home-model-card .space-y-2 {
  margin-top: auto;
}

.home-price-row span {
  color: #aebfb4;
  font-size: 0.72rem;
  font-weight: 700;
}

.home-price-row strong {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #f5fff8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.82rem;
}

.home-price-row em {
  color: #7f9288;
  font-size: 0.66rem;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.home-pricing-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.75rem;
  color: #9eafa4;
  font-size: 0.78rem;
  font-weight: 700;
}

.home-pricing-note a {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  color: #7dffc5;
}

.home-monthly-list {
  display: grid;
  gap: 0.75rem;
  flex: 1;
  padding-top: 0.875rem;
}

.home-monthly-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.95rem;
}

.home-monthly-card > .flex {
  flex-direction: column;
}

.home-monthly-price {
  width: 100%;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid rgba(125, 255, 197, 0.14);
  background:
    radial-gradient(circle at 84% 16%, rgba(125, 255, 197, 0.18), transparent 7rem),
    rgba(0, 0, 0, 0.26);
  padding: 0.85rem 0.9rem;
  text-align: left;
}

.home-monthly-price strong {
  display: inline-flex;
  margin-bottom: 0.55rem;
  border-radius: 9999px;
  background: rgba(61, 215, 159, 0.14);
  padding: 0.24rem 0.65rem;
  color: #7dffc5;
  font-size: 0.72rem;
  font-weight: 900;
}

.home-monthly-price span {
  display: block;
  color: #f5fff8;
  font-size: 2.25rem;
  font-weight: 950;
  line-height: 1;
  text-shadow: 0 0 24px rgba(125, 255, 197, 0.18);
}

.home-monthly-price em {
  display: block;
  margin-top: 0.25rem;
  color: #9eafa4;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 800;
}

.home-monthly-price del {
  display: inline-block;
  margin-top: 0.4rem;
  color: #8fb3a1;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration-color: rgba(125, 255, 197, 0.58);
  text-decoration-thickness: 2px;
}

.home-monthly-quota-grid {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.95rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.95rem;
  font-size: 0.82rem;
}

.home-monthly-benefit {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 8px;
  background: rgba(61, 215, 159, 0.08);
  padding: 0.45rem 0.55rem;
  color: #d9fff0;
  font-size: 0.78rem;
  font-weight: 850;
}

.home-monthly-benefit svg {
  flex-shrink: 0;
  color: #7dffc5;
}

.home-model-card .mt-4 {
  margin-top: 0.75rem;
}

.home-model-card .space-y-2 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.35rem;
}

.home-terminal {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(31, 22, 19, 0.95);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(134, 255, 213, 0.06);
}

.home-terminal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3.5rem;
  padding: 0 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(53, 39, 34, 0.76);
}

.home-terminal-body {
  padding: 1.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  color: #d8d0c8;
}

.home-console-line {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.75rem;
  line-height: 2;
}

.home-console-line span {
  overflow-wrap: anywhere;
}

.home-terminal-status {
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
}

.cursor-mark {
  display: inline-block;
  width: 0.55rem;
  height: 1.15rem;
  align-self: center;
  background: #4cffb3;
  animation: blink 1s steps(2, start) infinite;
}

.home-section {
  position: relative;
}

.home-section-kicker {
  font-size: 0.8rem;
  font-weight: 800;
  color: #a9b8ac;
}

.home-section-title {
  font-size: 2.125rem;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: 0;
  color: #f5fff8;
  text-wrap: balance;
}

.home-section-title::first-letter {
  color: #83ffba;
}

.home-price-compare-board {
  overflow: hidden;
  border: 1px solid rgba(125, 255, 197, 0.14);
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 0%, rgba(61, 215, 159, 0.13), transparent 22rem),
    linear-gradient(135deg, rgba(33, 26, 22, 0.94), rgba(7, 20, 14, 0.9));
  box-shadow: 0 28px 76px rgba(0, 0, 0, 0.28);
  padding: 1.25rem;
}

.home-price-compare-hero {
  display: grid;
  gap: 1.25rem;
  align-items: end;
}

.home-price-compare-label {
  display: inline-flex;
  border: 1px solid rgba(125, 255, 197, 0.2);
  border-radius: 9999px;
  background: rgba(7, 63, 42, 0.42);
  padding: 0.35rem 0.75rem;
  color: #7dffc5;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.home-price-boards {
  display: grid;
  gap: 1rem;
  margin-top: 1.15rem;
}

.home-price-board {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(4, 14, 10, 0.56);
}

.home-price-board-official {
  border-color: rgba(137, 174, 255, 0.22);
  background:
    radial-gradient(circle at 84% 0%, rgba(93, 140, 255, 0.16), transparent 14rem),
    rgba(4, 14, 10, 0.58);
}

.home-price-board-early {
  border-color: rgba(125, 255, 197, 0.22);
  background:
    radial-gradient(circle at 84% 0%, rgba(125, 255, 197, 0.17), transparent 14rem),
    rgba(4, 14, 10, 0.6);
}

.home-price-vs {
  position: relative;
  display: flex;
  min-height: 4.9rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.home-price-vs::before {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background:
    linear-gradient(90deg, transparent, rgba(159, 189, 255, 0.55), rgba(141, 255, 189, 0.64), transparent);
  content: "";
}

.home-price-vs-node {
  position: relative;
  z-index: 1;
  display: flex;
  width: 4.35rem;
  height: 4.35rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(125, 255, 197, 0.32);
  border-radius: 9999px;
  background:
    linear-gradient(145deg, rgba(16, 35, 59, 0.98), rgba(3, 42, 25, 0.98)),
    rgba(4, 14, 10, 0.96);
  box-shadow:
    0 0 0 0.55rem rgba(4, 14, 10, 0.72),
    0 0 0 0.62rem rgba(125, 255, 197, 0.08),
    0 16px 34px rgba(0, 0, 0, 0.28);
  color: #f5fff8;
}

.home-price-vs-node::before {
  position: absolute;
  inset: 0.42rem;
  border: 1px solid rgba(159, 189, 255, 0.24);
  border-radius: inherit;
  content: "";
}

.home-price-vs-node strong {
  position: relative;
  z-index: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1.12rem;
  font-weight: 950;
  letter-spacing: 0;
  line-height: 1;
}

.home-price-vs-node small {
  position: relative;
  z-index: 1;
  margin-top: 0.28rem;
  color: #9cffc9;
  font-size: 0.54rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.home-price-board-head {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 1rem 0.9rem;
}

.home-price-board-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.home-price-board-badge,
.home-price-board-currency {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  border-radius: 9999px;
  padding: 0 0.72rem;
  font-size: 0.7rem;
  font-weight: 950;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.home-price-board-badge {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.055);
  color: #dbe7ff;
}

.home-price-board-currency {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: #ffffff;
}

.home-price-board-early .home-price-board-badge {
  color: #a8ffd0;
}

.home-price-board-title {
  margin-top: 0.85rem;
  color: #f5fff8;
  font-size: 1.2rem;
  font-weight: 950;
  line-height: 1.25;
}

.home-price-board-note {
  margin-top: 0.45rem;
  color: #9eafa4;
  font-size: 0.8rem;
  font-weight: 750;
  line-height: 1.7;
}

.home-price-table-shell {
  max-height: 34rem;
  overflow: auto;
}

.home-price-split-table {
  width: 100%;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #d8e7dc;
  font-size: 0.82rem;
  table-layout: fixed;
}

.home-price-split-table th,
.home-price-split-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0.82rem 0.65rem;
  text-align: left;
  vertical-align: middle;
}

.home-price-split-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(8, 24, 17, 0.98);
  color: #b9c8bd;
  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;
  white-space: nowrap;
}

.home-price-split-table tbody tr {
  background: rgba(255, 255, 255, 0.02);
}

.home-price-split-table tbody tr:nth-child(odd) {
  background: rgba(255, 255, 255, 0.04);
}

.home-price-split-table tbody tr:hover {
  background: rgba(125, 255, 197, 0.075);
}

.home-price-split-table tbody tr:last-child td {
  border-bottom: 0;
}

.home-price-model-cell {
  width: 31%;
  border-right: 1px solid rgba(255, 255, 255, 0.065);
  background: rgba(0, 0, 0, 0.12);
}

.home-price-model-cell small {
  display: block;
  margin-top: 0.38rem;
  color: #8fb3a1;
  font-size: 0.7rem;
  font-weight: 850;
}

.home-price-model-name {
  display: inline-flex;
  max-width: 100%;
  color: #ffffff;
  font-weight: 950;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.home-price-metric-cell {
  width: 34%;
  min-width: 0;
}

.home-price-metric {
  display: block;
  color: #effff7;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.home-price-metric + small {
  display: block;
  margin-top: 0.24rem;
  color: #7f9288;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.35;
}

.home-price-value-cell {
  width: 35%;
  min-width: 0;
  text-align: right;
  white-space: nowrap;
}

.home-price-price {
  display: inline-flex;
  justify-content: flex-end;
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.94rem;
  font-weight: 950;
  letter-spacing: 0;
  line-height: 1.2;
}

.home-price-price-usd {
  color: #9fbdff;
  text-shadow: 0 0 18px rgba(110, 156, 255, 0.22);
}

.home-price-price-rmb {
  color: #8dffbd;
  font-size: 1rem;
  text-shadow: 0 0 18px rgba(125, 255, 197, 0.24);
}

.home-feature-card,
.home-contact-board,
.home-contact-panel {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(33, 26, 22, 0.9);
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.22);
}

.home-feature-card {
  min-height: 19rem;
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.home-feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(125, 255, 197, 0.24);
}

.home-feature-card-active {
  border-color: rgba(29, 211, 148, 0.48);
  background: rgba(4, 9, 28, 0.94);
}

.home-card-icon {
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.home-routing-board {
  display: grid;
  gap: 1rem;
  overflow: hidden;
  border: 1px solid rgba(125, 255, 197, 0.16);
  border-radius: 8px;
  background:
    radial-gradient(circle at 12% 18%, rgba(61, 215, 159, 0.13), transparent 20rem),
    radial-gradient(circle at 88% 0%, rgba(156, 255, 61, 0.08), transparent 18rem),
    rgba(33, 26, 22, 0.92);
  box-shadow: 0 28px 76px rgba(0, 0, 0, 0.28);
  padding: 1.25rem;
}

.home-routing-main,
.home-routing-flow {
  min-width: 0;
}

.home-routing-stat {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid rgba(125, 255, 197, 0.13);
  border-radius: 8px;
  background: rgba(7, 20, 14, 0.42);
  padding: 0.9rem;
}

.home-routing-stat svg {
  flex-shrink: 0;
  color: #83ffba;
}

.home-routing-stat strong,
.home-routing-stat span {
  display: block;
}

.home-routing-stat strong {
  color: #f5fff8;
  font-size: 0.9rem;
  font-weight: 950;
}

.home-routing-stat span {
  margin-top: 0.25rem;
  color: #9eafa4;
  font-size: 0.75rem;
  font-weight: 750;
  line-height: 1.55;
}

.home-routing-note {
  border-left: 3px solid rgba(125, 255, 197, 0.65);
  border-radius: 8px;
  background: rgba(61, 215, 159, 0.08);
  padding: 0.85rem 1rem;
  color: #c9f7df;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.8;
}

.home-routing-flow {
  display: grid;
  gap: 0.75rem;
}

.home-routing-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  background: rgba(4, 14, 10, 0.46);
  padding: 0.95rem;
}

.home-routing-step > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #3dd79f, #b9ff9b);
  color: #062516;
  font-size: 0.75rem;
  font-weight: 950;
}

.home-routing-step h4 {
  color: #f5fff8;
  font-size: 0.98rem;
  font-weight: 950;
}

.home-routing-step p {
  margin-top: 0.28rem;
  color: #a9c8b6;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.65;
}

.home-contact-board {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
}

.home-contact-main,
.home-contact-panel {
  min-width: 0;
}

.home-contact-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(125, 255, 197, 0.13);
  background: rgba(6, 10, 8, 0.64);
  padding: 1rem;
}

.home-contact-card span {
  display: block;
  color: #9eafa4;
  font-size: 0.78rem;
  font-weight: 850;
}

.home-contact-card strong {
  display: block;
  margin-top: 0.35rem;
  color: #f5fff8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1rem;
  font-weight: 950;
}

.home-contact-copy-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(125, 255, 197, 0.2);
  background: rgba(61, 215, 159, 0.12);
  padding: 0 0.9rem;
  color: #d9fff0;
  font-size: 0.8rem;
  font-weight: 900;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.home-contact-copy-button:hover {
  border-color: rgba(125, 255, 197, 0.44);
  background: rgba(61, 215, 159, 0.18);
  transform: translateY(-1px);
}

.home-contact-topic {
  display: inline-flex;
  align-items: center;
  min-height: 1.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.045);
  padding: 0 0.75rem;
  color: #b9c8bd;
  font-size: 0.76rem;
  font-weight: 850;
}

.home-contact-panel {
  padding: 1.5rem;
  background:
    radial-gradient(circle at 82% 10%, rgba(125, 255, 197, 0.14), transparent 12rem),
    rgba(7, 20, 14, 0.58);
}

.home-contact-panel h3 {
  margin-top: 1rem;
  color: #f5fff8;
  font-size: 1.35rem;
  font-weight: 950;
  line-height: 1.35;
}

.home-contact-panel p {
  margin-top: 0.9rem;
  color: #a9c8b6;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.85;
}

.home-final-cta {
  overflow: hidden;
  border-radius: 8px;
  background:
    radial-gradient(circle at 88% 18%, rgba(215, 255, 149, 0.7), transparent 17rem),
    linear-gradient(135deg, #6ee7aa 0%, #b8f89b 100%);
  box-shadow: 0 24px 70px rgba(43, 214, 145, 0.2);
  padding: 3rem 1.5rem;
  text-align: center;
}

.home-final-cta-button,
.home-final-cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  border-radius: 9999px;
  padding: 0 1.2rem;
  font-size: 0.88rem;
  font-weight: 900;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.home-final-cta-button {
  background: #062516;
  color: #dfffea;
}

.home-final-cta-secondary {
  border: 1px solid rgba(6, 37, 22, 0.14);
  background: rgba(255, 255, 255, 0.36);
  color: #07351f;
}

.home-final-cta-button:hover,
.home-final-cta-secondary:hover {
  transform: translateY(-2px);
}

:global(.home-nav-actions .relative > button) {
  color: #d9fff0;
  border-radius: 9999px;
}

:global(.home-nav-actions .relative > button:hover) {
  background: rgba(255, 255, 255, 0.1);
}

@media (min-width: 1024px) {
  .home-price-compare-board {
    padding: 1.5rem;
  }

  .home-price-boards {
    grid-template-columns: minmax(0, 1fr) 4.35rem minmax(0, 1fr);
    align-items: stretch;
  }

  .home-price-vs {
    min-height: auto;
    align-self: stretch;
  }

  .home-price-vs::before {
    inset: 0 auto;
    left: 50%;
    width: 1px;
    height: 100%;
    background:
      linear-gradient(180deg, transparent, rgba(159, 189, 255, 0.5), rgba(141, 255, 189, 0.6), transparent);
  }

  .home-routing-board {
    grid-template-columns: minmax(0, 1.08fr) minmax(21rem, 0.92fr);
    align-items: stretch;
    padding: 1.5rem;
  }

  .home-routing-flow {
    align-content: stretch;
  }

  .home-contact-board {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.64fr);
    align-items: stretch;
    padding: 2rem;
  }
}

@media (min-width: 640px) {
  .home-monthly-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-nav {
    height: auto;
    padding: 1rem 0;
    align-items: flex-start;
  }

  .home-nav-actions {
    gap: 0.35rem;
  }

  .home-icon-button {
    width: 2.25rem;
    height: 2.25rem;
  }

  .home-dashboard-pill {
    min-height: 2.25rem;
    padding: 0.4rem 0.7rem;
  }

  .home-hero-title {
    font-size: 3.2rem;
  }

  .home-terminal-body {
    padding: 1rem;
    font-size: 0.8rem;
  }

  .home-pricing-head {
    flex-direction: column;
  }

  .home-pricing-switch,
  .home-monthly-price {
    width: 100%;
  }

  .home-pricing-switch-button {
    flex: 1;
  }

  .home-monthly-price {
    text-align: left;
  }

  .home-section-title {
    font-size: 1.9rem;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-mark {
    animation: none;
  }

  .home-dashboard-pill,
  .home-primary-button,
  .home-secondary-button,
  .home-feature-card,
  .home-icon-button,
  .home-contact-copy-button,
  .home-final-cta-button,
  .home-final-cta-secondary {
    transition: none;
  }
}
</style>

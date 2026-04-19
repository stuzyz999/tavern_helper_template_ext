<template>
  <div class="tab-family">
    <!-- 子 tab 切换（对齐原有 tab-bar 风格） -->
    <div class="sub-tab-bar">
      <button
        class="sub-tab-btn"
        :class="{ active: subTab === 'family' }"
        @click="subTab = 'family'"
      >🌸 家族</button>
      <button
        class="sub-tab-btn"
        :class="{ active: subTab === 'system' }"
        @click="subTab = 'system'"
      >⚡ 系统</button>
    </div>

    <!-- ═══ 家族 tab ═══ -->
    <template v-if="subTab === 'family'">
      <!-- 总人口 -->
      <div class="section">
        <div class="info-grid">
          <div class="info-item full">
            <span class="label">家族总人口</span>
            <span class="value highlight">{{ data.家族?.总人口 ?? 0 }} 人</span>
          </div>
        </div>
      </div>

      <!-- 无道侣时空状态 -->
      <div v-if="!hasDaolv" class="section">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>尚无道侣</span>
        </div>
      </div>

      <!-- 道侣卡片列表（可折叠） -->
      <div v-else class="section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          道侣
          <span class="count-badge">{{ daolvCount }}</span>
        </div>

        <div class="daolv-list">
          <div v-for="(daolv, pName) in data.家族?.道侣" :key="pName" class="daolv-card">
            <!-- 折叠头部（始终可见，点击展开/收起） -->
            <div class="daolv-header" @click="toggleDaolv(String(pName))">
              <div class="daolv-avatar">{{ String(pName).charAt(0) }}</div>
              <div class="daolv-summary">
                <div class="daolv-name-row">
                  <span class="daolv-name">{{ pName }}</span>
                  <span v-if="daolv.是否受孕" class="tag tag-pregnant">孕中</span>
                  <span class="tag tag-realm">{{ parseRelation(daolv.关系).修为 }}</span>
                </div>
                <div class="daolv-sub">
                  <span class="label">{{ parseRelation(daolv.关系).关系 }}</span>
                  <span class="child-count-tag">子嗣 {{ Object.keys(daolv.子嗣 ?? {}).length }}</span>
                </div>
              </div>
              <!-- 折叠箭头 -->
              <svg
                class="collapse-icon"
                :class="{ expanded: expandedDaolv.has(String(pName)) }"
                viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <!-- 展开内容 -->
            <div v-if="expandedDaolv.has(String(pName))" class="daolv-body">
              <!-- 子嗣列表 -->
              <div v-if="Object.keys(daolv.子嗣 ?? {}).length > 0" class="children-list">
                <div v-for="(child, cName) in daolv.子嗣" :key="cName" class="child-block">
                  <!-- 子嗣行 -->
                  <div class="child-row">
                    <span class="age-tag" :class="child.年龄段">{{ child.年龄段 }}</span>
                    <span class="child-name">{{ cName }}</span>
                    <span v-if="child.升格道侣" class="tag tag-upgrade">已升格道侣</span>
                    <span v-if="child.是否受孕" class="tag tag-pregnant small">孕中</span>
                    <span class="realm-text">{{ parseRelation(child.关系).修为 }}</span>
                  </div>
                  <!-- 子嗣的子嗣（升格道侣后，仍属子嗣辈，标注母亲） -->
                  <div v-if="Object.keys(child.子嗣 ?? {}).length > 0" class="nested-list">
                    <div v-for="(gc, gcName) in child.子嗣" :key="gcName" class="nested-row">
                      <span class="nest-line">└</span>
                      <span class="age-tag small" :class="gc.年龄段">{{ gc.年龄段 }}</span>
                      <span class="nested-name">{{ gcName }}</span>
                      <span class="mother-tag">母：{{ cName }}</span>
                      <span v-if="gc.是否受孕" class="tag tag-pregnant small">孕中</span>
                      <span class="realm-text small">{{ parseRelation(gc.关系).修为 }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-children">暂无子嗣</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ 系统 tab ═══ -->
    <template v-if="subTab === 'system'">
      <!-- 积分 + 因果等级 -->
      <div class="section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          越生越强系统
        </div>
        <div class="lifespan-grid">
          <div class="lifespan-item">
            <span class="label">积分</span>
            <span class="value highlight">{{ data.$系统积分 ?? 0 }}</span>
          </div>
          <div class="lifespan-item">
            <span class="label">因果等级</span>
            <span class="value" :style="{ color: karmaColor }">{{ data.$系统因果等级 ?? '清明' }}</span>
          </div>
        </div>
      </div>

      <!-- 当前任务 -->
      <div class="section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          当前任务
        </div>
        <div class="info-item full task-item">
          <span v-if="data.$系统任务" class="value task-text">{{ data.$系统任务 }}</span>
          <span v-else class="value empty">暂无进行中的任务</span>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
          </svg>
          成就
          <span class="count-badge">{{ achievementCount }}</span>
        </div>
        <div v-if="achievementCount > 0" class="achievement-list">
          <div v-for="(time, name) in data.$系统成就" :key="name" class="info-item full achievement-item">
            <span class="value highlight ach-name">{{ name }}</span>
            <span class="label">{{ time }}</span>
          </div>
        </div>
        <div v-else class="empty-state small">
          <span>尚无成就</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStatusStore } from '../store';

const store = useStatusStore();
const data = computed(() => store.data);

const subTab = ref<'family' | 'system'>('family');

// 折叠状态：默认全部折叠
const expandedDaolv = ref<Set<string>>(new Set());

function toggleDaolv(name: string) {
  const s = new Set(expandedDaolv.value);
  if (s.has(name)) s.delete(name);
  else s.add(name);
  expandedDaolv.value = s;
}

const hasDaolv = computed(() => {
  const d = data.value.家族?.道侣;
  return d && Object.keys(d).length > 0;
});

const daolvCount = computed(() => {
  const d = data.value.家族?.道侣;
  return d ? Object.keys(d).length : 0;
});

const achievementCount = computed(() => {
  const a = data.value.$系统成就;
  return a ? Object.keys(a).length : 0;
});

const karmaColor = computed(() => {
  const k = data.value.$系统因果等级;
  if (k === '微染') return '#f59e0b';
  if (k === '业火') return '#ef4444';
  return '#10b981';
});

function parseRelation(raw: string): { 修为: string; 关系: string } {
  if (!raw) return { 修为: '', 关系: '' };
  const parts = raw.split('|');
  return { 修为: parts[1] ?? '', 关系: parts[3] ?? '' };
}
</script>

<style scoped>
.tab-family {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── 子 tab 栏（对齐原有 tab-bar 风格） ─── */
.sub-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--divider);
  margin: -14px -14px 0;
  padding: 0 14px;
  background: var(--tab-bg);
}

.sub-tab-btn {
  flex: 1;
  padding: 11px 0;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: var(--tab-text);
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
  position: relative;
}

.sub-tab-btn:hover {
  color: var(--tab-active);
  background: var(--tab-hover-bg);
}

.sub-tab-btn.active {
  color: var(--tab-active);
}

.sub-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--tab-active);
  border-radius: 1px;
}

/* ─── section（完全对齐 TabBasic） ─── */
.section {
  background: var(--card-bg, #fafafa);
  border: 1px solid var(--card-border, rgba(180, 150, 100, 0.2));
  border-radius: 10px;
  padding: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-gold, #b8963e);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.count-badge {
  padding: 2px 8px;
  background: rgba(200, 169, 110, 0.15);
  color: var(--accent-gold, #b8963e);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

/* ─── info-grid / info-item（复用 TabBasic 模式） ─── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--content-bg, #fff);
  border-radius: 6px;
  border: 1px solid var(--card-border, rgba(180, 150, 100, 0.1));
}

.info-item.full {
  grid-column: 1 / -1;
}

.label {
  font-size: 12px;
  color: var(--text-muted, #9a8b7a);
}

.value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #2a1f1a);
}

.value.highlight {
  color: var(--accent-gold, #b8963e);
}

.value.empty {
  color: var(--text-muted, #9a8b7a);
  font-style: italic;
  font-weight: 400;
}

/* ─── 寿元网格（复用 TabBasic 模式，用于积分/因果） ─── */
.lifespan-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.lifespan-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: var(--content-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--card-border, rgba(180, 150, 100, 0.1));
}

.lifespan-item .label {
  font-size: 11px;
  color: var(--text-muted, #9a8b7a);
  margin-bottom: 4px;
}

.lifespan-item .value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #2a1f1a);
}

/* ─── 道侣卡片 ─── */
.daolv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daolv-card {
  background: var(--content-bg, #fff);
  border: 1px solid var(--card-border, rgba(180, 150, 100, 0.1));
  border-radius: 8px;
  overflow: hidden;
}

/* 折叠头部 */
.daolv-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.daolv-header:hover {
  background: var(--tab-hover-bg);
}

.daolv-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.12);
  border: 1.5px solid var(--accent-gold, #b8963e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-gold, #b8963e);
  flex-shrink: 0;
}

.daolv-summary {
  flex: 1;
  min-width: 0;
}

.daolv-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.daolv-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #2a1f1a);
}

.daolv-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.child-count-tag {
  font-size: 10px;
  color: var(--accent-gold, #b8963e);
  background: rgba(200, 169, 110, 0.1);
  padding: 1px 7px;
  border-radius: 4px;
}

/* 折叠箭头 */
.collapse-icon {
  flex-shrink: 0;
  color: var(--text-muted, #9a8b7a);
  transition: transform 0.2s;
}

.collapse-icon.expanded {
  transform: rotate(180deg);
}

/* 展开内容 */
.daolv-body {
  padding: 0 12px 10px;
  border-top: 1px dashed var(--divider);
}

/* ─── 子嗣列表 ─── */
.children-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
}

.child-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.child-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.child-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #2a1f1a);
}

.realm-text {
  font-size: 11px;
  color: var(--text-muted, #9a8b7a);
}

.realm-text.small {
  font-size: 10px;
}

.no-children {
  font-size: 12px;
  color: var(--text-muted, #9a8b7a);
  padding: 8px 0 2px;
  font-style: italic;
}

/* ─── 嵌套子嗣（升格道侣后的子嗣，仍属子嗣辈） ─── */
.nested-list {
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nested-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.nest-line {
  color: var(--text-muted, #9a8b7a);
  font-size: 11px;
  flex-shrink: 0;
}

.nested-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #6b5d4e);
}

.mother-tag {
  font-size: 10px;
  color: var(--accent-gold, #b8963e);
  opacity: 0.85;
  padding: 1px 6px;
  background: rgba(200, 169, 110, 0.1);
  border: 1px solid rgba(200, 169, 110, 0.2);
  border-radius: 4px;
}

/* ─── 通用 tag ─── */
.tag {
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.tag.small {
  font-size: 9px;
  padding: 1px 5px;
}

.tag-pregnant {
  background: rgba(236, 72, 153, 0.12);
  color: #ec4899;
}

.tag-realm {
  background: var(--card-bg, #f3f4f6);
  color: var(--text-muted, #9a8b7a);
  border: 1px solid var(--card-border, rgba(180, 150, 100, 0.15));
}

.tag-upgrade {
  background: rgba(200, 169, 110, 0.12);
  color: var(--accent-gold, #b8963e);
  border: 1px solid rgba(200, 169, 110, 0.25);
}

/* ─── 年龄段 tag ─── */
.age-tag {
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-muted, #9a8b7a);
}

.age-tag.婴儿 { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
.age-tag.幼女 { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.age-tag.少女 { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.age-tag.成年 { background: rgba(200, 169, 110, 0.12); color: var(--accent-gold, #b8963e); }
.age-tag.small { font-size: 9px; padding: 1px 5px; }

/* ─── 任务 ─── */
.task-item {
  align-items: flex-start;
  padding: 10px 12px;
}

.task-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

/* ─── 成就 ─── */
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievement-item {
  padding: 8px 10px;
}

.ach-name {
  font-size: 13px;
}

/* ─── 空状态 ─── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  color: var(--text-muted, #9a8b7a);
  text-align: center;
  gap: 8px;
}

.empty-state svg { opacity: 0.4; }
.empty-state span { font-size: 12px; }
.empty-state.small { padding: 10px; }

/* PC端字号放大 */
@media (min-width: 501px) {
  .section-title { font-size: 14px; }
  .daolv-name { font-size: 14px; }
  .child-name { font-size: 14px; }
  .label { font-size: 13px; }
  .value { font-size: 14px; }
}

/* 手机端适配 */
@media (max-width: 500px) {
  .tab-family { padding: 10px; gap: 12px; }
  .sub-tab-bar { margin: -10px -10px 0; padding: 0 10px; }
  .section { padding: 10px; }
  .daolv-header { padding: 8px 10px; }
  .daolv-avatar { width: 32px; height: 32px; font-size: 13px; }
  .daolv-name { font-size: 12px; }
  .child-name { font-size: 12px; }
  .lifespan-item .value { font-size: 14px; }
}
</style>

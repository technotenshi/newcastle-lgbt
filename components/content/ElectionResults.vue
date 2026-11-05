<script setup>
import { computed } from 'vue';
import { formatElectionResults } from '../../utils/election-results.mjs';

const props = defineProps({
  contest: { type: Object, required: true },
});
const results = computed(() => formatElectionResults(props.contest));
</script>

<template>
  <section
    class="election-results"
    :aria-label="`${results.id}: ${results.title}`"
  >
    <h3 class="election-results-title">
      {{ results.id }}: {{ results.title }}
    </h3>
    <div class="election-results-status">
      <strong>{{ results.statusText }}</strong>
      <div v-if="results.status.source">
        {{ results.status.source }}<template v-if="results.statusTime">
          ; {{ results.statusTimeLabel }}
          <time :datetime="results.status.at || results.status.observedAt">{{ results.statusTime }}</time>
        </template>.
      </div>
      <div
        v-if="$slots.status"
        class="election-results-evidence"
      >
        <slot name="status" />
      </div>
    </div>
    <ul
      class="election-results-list"
      role="list"
    >
      <li
        v-for="row in results.results"
        :key="row.id"
        class="election-results-row"
      >
        <div class="election-results-line">
          <div class="election-results-label">
            <strong>{{ row.label }}</strong>
            <span v-if="results.type === 'candidate' || (results.type === 'seats' && row.party)">{{ row.party }}</span>
            <template v-else-if="results.type === 'measure'">
              <span v-if="row.stance === 'favorable'">Supports LGBTQ+ rights</span>
              <span v-else-if="row.stance === 'harmful'">Harms LGBTQ+ rights</span>
              <span v-else>No stance assigned</span>
            </template>
          </div>
          <div class="election-results-numbers">
            {{ row.count }} {{ results.type === 'seats' ? results.unit : 'votes' }}
            <strong>{{ row.percent === null ? 'Share unavailable' : `${row.percent}%` }}</strong>
            <span v-if="row.before !== undefined">Before: {{ row.before }}; change: {{ row.change }}</span>
          </div>
        </div>
        <div
          class="election-results-track"
          aria-hidden="true"
        >
          <div
            class="election-results-bar"
            :class="{
              'election-results-blue': row.tone === 'blue',
              'election-results-red': row.tone === 'red',
              'election-results-gold': row.tone === 'gold',
              'election-results-green': row.tone === 'green',
              'election-results-gray': row.tone === 'gray',
            }"
            :style="{ width: `${row.percent ?? 0}%` }"
          />
        </div>
      </li>
    </ul>
    <div
      v-if="results.lead"
      class="election-results-lead"
    >
      {{ results.lead }}
    </div>
    <div class="election-results-completeness">
      {{ results.completeness }}
    </div>
    <div class="election-results-source">
      {{ results.type === 'seats' ? 'Source' : 'Count source' }}: {{ results.source }}.
      {{ results.type === 'seats' ? 'Verified as of' : 'Snapshot' }}: <time :datetime="results.snapshot">{{ results.snapshotTime }}</time>.
      <div
        v-if="$slots.source"
        class="election-results-evidence"
      >
        <slot name="source" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.election-results {
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 1px solid #b5bdc5;
  border-radius: 0.5rem;
  background: #fff;
  color: #202830;
  font-size: 1rem;
  line-height: 1.5;
  text-align: left;
  overflow-wrap: anywhere;
}
.election-results .election-results-title {
  margin: 0.15rem 0 0.75rem;
  font-size: 1.25rem;
  line-height: 1.4;
  color: inherit;
}
.election-results-id { font-weight: 700; }
.election-results-status { margin-bottom: 1rem; }
.election-results .election-results-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.election-results .election-results-row { margin: 0; padding: 0; min-width: 0; }
.election-results-line {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.4rem;
}
.election-results-label, .election-results-numbers { min-width: 0; }
.election-results-label span, .election-results-numbers strong { display: block; }
.election-results-label span { font-size: 0.9rem; }
.election-results-numbers { text-align: right; font-variant-numeric: tabular-nums; }
.election-results-track { width: 100%; height: 0.75rem; background: #e5e8eb; border-radius: 0.2rem; overflow: hidden; }
.election-results-bar { height: 100%; }
.election-results-blue { background: #175a9e; }
.election-results-red { background: #b52f3a; }
.election-results-gold { background: #8c6700; }
.election-results-green { background: #217440; }
.election-results-gray { background: #626970; }
.election-results-lead { margin-top: 1rem; font-weight: 600; }
.election-results-completeness, .election-results-source { margin-top: 0.5rem; font-size: 0.9rem; }
.election-results .election-results-evidence :deep(a) {
  color: #175a9e;
  text-decoration: underline;
}
.election-results .election-results-evidence :deep(a:focus-visible) {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.election-results .election-results-evidence :deep(p) {
  margin: 0.25rem 0 0;
  font-size: inherit;
  line-height: 1.5;
}
@media (max-width: 480px) {
  .election-results { padding: 1rem; }
  .election-results-line { flex-direction: column; }
  .election-results-numbers { text-align: left; }
}
@media print {
  .election-results { break-inside: avoid; border-color: #000; color: #000; }
  .election-results-track { border: 1px solid #777; box-sizing: border-box; }
  .election-results-bar { background: #555; }
}
</style>

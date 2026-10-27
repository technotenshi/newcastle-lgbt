<template>
  <a
    href="https://www.simpleanalytics.com?utm_source=newcastle.lgbt&utm_content=badge"
    referrerpolicy="origin"
    target="_blank"
    rel="noopener"
    class="sa-badge-link"
  >
    <picture>
      <source
        srcset="https://simpleanalyticsbadges.com/newcastle.lgbt?mode=dark&counter=false"
        media="(prefers-color-scheme: dark)"
      >
      <img
        src="https://simpleanalyticsbadges.com/newcastle.lgbt?mode=light&counter=false&text-light=%23334344"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        crossorigin="anonymous"
        width="210"
        height="50"
        alt="Simple Analytics — privacy-friendly analytics badge, links to simpleanalytics.com"
      >
    </picture>
  </a>
</template>

<style scoped>
/*
 * Required for free-plan Simple Analytics accounts: a visible badge linking
 * back to simpleanalytics.com must appear in a footer shared by every page.
 * See docs.simpleanalytics.com/free-plan-badge. The focus outline below is
 * added on top of the vendor-supplied markup because this site's theme
 * disables the default outline on several other link classes.
 */
.sa-badge-link {
  display: inline-block;
  line-height: 0;
}

.sa-badge-link:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
</style>

<template>
  <div class="app">
    <header class="app__header">
      <h1>Newcastle LGBT</h1>
      <p>Celebrating the community in the North East.</p>
    </header>
    <main class="app__main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background: #f8f8fb;
  color: #1f1f1f;
}

.app__header {
  padding: 3rem 1.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(90deg, #6b11ff, #ff3cac 50%, #ffcc70);
  color: #ffffff;
}

.app__header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.app__header p {
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.app__main {
  flex: 1;
  padding: 2rem 1.5rem;
}
</style>

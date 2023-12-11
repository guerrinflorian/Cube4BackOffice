<template>
  <q-page class="relative-position">
    <!-- Background Image -->
    <img
      src="../assets/accueil.png"
      class="absolute-position"
    />
    <!-- Centered Logo -->
    <div class="absolute-center">
      <img
        src="../assets/logo_negosud.png"
        class="centered-logo"
      />
    </div>
  </q-page>
</template>

<script>
export default {};
</script>

<style scoped>
.relative-position {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  overflow-y: hidden; 
  overflow-x: hidden;
}

.absolute-position {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
}

.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.centered-logo {
  max-width: 200px;
  width: auto;
  height: auto;
}
</style>

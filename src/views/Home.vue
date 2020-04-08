<template>
  <div>
    <h4>Home page</h4>
    <span class="error">Danger</span>
  </div>
</template>
<script>
import style from './../style/home.css'

export default {
  name: 'home',
  data: () => {
    return {
      style: Object.assign({}, style)
    }
  }
}
</script>

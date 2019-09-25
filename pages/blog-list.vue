<template>
  <v-data-table
    :loading="loading"
    :headers="headers"
    :items="items"
    :items-per-page="5"
    class="elevation-1"
  ></v-data-table>
</template>

<script>
export default {
  loading: true,
  data() {
    return {
      loading: true,
      headers: [
        {
          text: "Blog ID",
          value: "id"
        },
        {
          text: "Name",
          value: "name"
        },
        {
          text: "Url",
          value: "url"
        }
      ],
      items: []
    };
  },
  mounted() {
    var data = this.$axios
      .get("https://www.googleapis.com/blogger/v3/users/self/blogs")
      .then(res => {
        this.loading = false;
        this.items = res.data.items;
      });
  }
};
</script>

<template>
  <div>
    <h1>Spin Artikel Indonesia</h1>
    <p>Online spinner tool untuk artikel bahasa Indonesia</p>
    <v-card>
      <v-card-text>
        <v-textarea v-model="input" outlined rows="20" label="Input Artikel"></v-textarea>
        <v-btn @click="submit" class="blue">Generate</v-btn>
        <div v-if="result" style="padding-top:20px">
          <h1>Result</h1>
          <br />
          <v-divider></v-divider>
          <v-textarea v-model="result" outlined rows="20" label="Input Artikel"></v-textarea>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      input: null,
      result: null
    };
  },
  methods: {
    submit() {
      const params = new URLSearchParams();
      params.append("content", this.input);
      this.$axios
        .post("/api/generate-article", params)
        .then(result => {
          this.result = result.data;
        })
        .catch(err => {
          alert("failed");
        });
    }
  }
};
</script>

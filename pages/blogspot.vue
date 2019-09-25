<template>
  <v-form v-model="valid">
    <h1 class="font-weight-bold text-center">Blogspot Artikel Generator</h1>
    <span style="display:none">token: {{ google_token }}</span>
    param = {{ $route.params.filename }} , {{ $route.params.platform }}
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <v-file-input label="Import File (CSV)" outlined></v-file-input>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field outlined v-model="kategori" label="Kategori (Spintax)" required></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="start_date"
                label="Start Date"
                prepend-icon="mdi-calendar-range"
                readonly
                v-on="on"
                outlined
              ></v-text-field>
            </template>
            <v-date-picker v-model="start_date" @input="menu2 = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu
            v-model="menu3"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="end_date"
                label="End Date"
                prepend-icon="mdi-calendar-range"
                readonly
                v-on="on"
                outlined
              ></v-text-field>
            </template>
            <v-date-picker v-model="end_date" @input="menu3 = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field outlined v-model="nama_file" label="Nama File"></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field outlined v-model="judul" label="Judul Dengan Spintax"></v-text-field>
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea outlined v-model="artikel" label="Artikel Dengan Spintax"></v-textarea>
        </v-col>
        <v-col cols="12" md="12" class="text-right">
          <v-btn @click="refreshToken">Refresh Token</v-btn>
          <v-btn @click="google" variant="outline-success">Google</v-btn>
          <v-btn outlined>Cancel</v-btn>
          <v-btn color="primary">Generate Artikel</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      end_date: new Date().toISOString().substr(0, 10),
      start_date: new Date().toISOString().substr(0, 10),
      kategory: null,
      nama_file: null,
      menu2: false,
      menu3: false,
      valid: false,
      artikel: null,
      import_file: null,
      parseCsv: null
    };
  },
  computed: {
    google_token() {
      return this.$auth.getToken("google");
    }
  },
  methods: {
    async google() {
      await this.$auth.loginWith("google").catch(e => {
        this.$toast.show("Error", { icon: "fingerprint" });
      });
    },
    refreshToken() {
      this.$auth.refreshToken;
    }
  }
};
</script>

<style>
</style>

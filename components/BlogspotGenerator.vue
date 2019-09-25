<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <v-card-title>File: {{ fileName }}</v-card-title>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            outlined
            :rules="kategoriRules"
            v-model="kategori"
            label="Kategori (Spintax)"
            required
          ></v-text-field>
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
          <v-text-field
            required
            :rules="judulRules"
            outlined
            v-model="judul"
            label="Judul Dengan Spintax"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            required
            :rules="artikelRules"
            outlined
            v-model="artikel"
            label="Artikel Dengan Spintax"
          ></v-textarea>
        </v-col>
        <v-col cols="12" md="12" class="text-right">
          <v-btn :disabled="!valid || loading" @click="submitGenerate" color="primary">{{btnText}}</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  props: ["fileName"],
  data() {
    return {
      loading: false,
      end_date: new Date().toISOString().substr(0, 10),
      start_date: new Date().toISOString().substr(0, 10),
      kategori: null,
      nama_file: null,
      menu2: false,
      menu3: false,
      valid: false,
      artikel: null,
      import_file: null,
      parseCsv: null,
      judul: null,
      judulRules: [v => !!v || "Silahkan isi Judul"],
      artikelRules: [v => !!v || "Silahkan isi Artikel"],
      kategoriRules: [v => !!v || "Silahkan isi Kategori"]
    };
  },
  computed: {
    btnText() {
      if (this.loading) {
        return "Loading...";
      }

      return "Generate Artikel";
    },
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
    },
    submitGenerate() {
      this.loading = true;
      this.$axios
        .post("/api/generate/blogger/" + this.fileName, {
          category: this.kategori,
          judul: this.judul,
          start_date: this.start_date,
          end_date: this.end_date,
          content: this.artikel,
          nama_file: this.nama_file
        })
        .then(res => {
          this.loading = false;
          alert(res.data);
        });
    }
  }
};
</script>

<style>
</style>

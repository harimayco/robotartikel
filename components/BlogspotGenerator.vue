<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="12" md="12">
              <span class="title">File: {{ fileName }}</span>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field outlined v-model="nama_file" label="Nama File"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                outlined
                :rules="kategoriRules"
                v-model="kategori"
                label="Kategori (Spintax)"
                required
              ></v-text-field>
            </v-col>
            <v-col v-if="platform == 'wordpress'" cols="12" md="6">
              <v-text-field
                outlined
                :rules="tagRules"
                v-model="tags"
                label="Tags (Spintax)"
                required
              ></v-text-field>
            </v-col>
            <v-col v-if="platform == 'wordpress'" cols="12" md="6">
              <v-select v-model="status" :items="status_select" label="Status" outlined></v-select>
            </v-col>

            <v-col cols="12" md="6">
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
                  <v-text-field v-model="start_date" label="Start Date" readonly v-on="on" outlined></v-text-field>
                </template>
                <v-date-picker v-model="start_date" @input="menu2 = false"></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="6">
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
                  <v-text-field v-model="end_date" label="End Date" readonly v-on="on" outlined></v-text-field>
                </template>
                <v-date-picker v-model="end_date" @input="menu3 = false"></v-date-picker>
              </v-menu>
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
              <v-btn
                :disabled="!valid || loading"
                @click="submitGenerate"
                color="primary"
              >{{btnText}}</v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" v-if="exported.length" md="6" class>
          <v-card-title>
            Exported Files &nbsp;&nbsp;&nbsp;
            <v-btn color="success" @click="downloadAll">Download All</v-btn>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items-per-page="10"
            :loading="loading"
            :sort-by="['name']"
            :sort-desc="[false]"
            :items="exported_files"
            class="elevation-6"
          >
            <template v-slot:item.url="{ item }">
              <a :href="item.url" download>
                <v-icon small class="mdi mdi-download"></v-icon>
              </a>
              &nbsp;
              <a :href="item.url + '.csv'" download>CSV</a>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import multiDownload from "multi-download";
export default {
  props: ["fileName", "platform"],
  data() {
    return {
      headers: [
        {
          text: "File Name",
          value: "name"
        },
        {
          text: "Ukuran",
          value: "size"
        },
        {
          text: "Download",
          value: "url"
        }
      ],
      status_select: ["publish", "draft"],
      loading: false,
      end_date: new Date().toISOString().substr(0, 10),
      start_date: new Date().toISOString().substr(0, 10),
      kategori: null,
      nama_file: null,
      status: "publish",
      menu2: false,
      menu3: false,
      valid: false,
      tag: "",
      artikel: null,
      import_file: null,
      parseCsv: null,
      judul: null,
      judulRules: [v => !!v || "Silahkan isi Judul"],
      tagsRules: [
        v => (!!v && this.platform == "wordpress") || "Silahkan isi Tags"
      ],
      artikelRules: [v => !!v || "Silahkan isi Artikel"],
      kategoriRules: [v => !!v || "Silahkan isi Kategori"],
      exported: []
    };
  },
  computed: {
    btnText() {
      if (this.loading) {
        return "Loading...";
      }

      return "Generate Artikel";
    },
    exported_urls() {
      return this.exported_files.map(el => {
        return el.url;
      });
    },
    exported_files() {
      return this.exported.map(el => {
        return {
          name: el.name,
          size: el.size,
          url: "/files/export/" + this.platform + "/" + el.name
        };
      });
    },

    google_token() {
      return this.$auth.getToken("google");
    }
  },
  mounted() {
    let today = new Date();
    this.start_date = today.setDate(today.getDate() - 30);
    this.start_date = today.toISOString().substr(0, 10);
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
        .post("/api/generate/" + this.platform + "/" + this.fileName, {
          category: this.kategori,
          judul: this.judul,
          start_date: this.start_date,
          end_date: this.end_date,
          content: this.artikel,
          nama_file: this.nama_file,
          tags: this.tags,
          status: this.status
        })
        .then(res => {
          this.loading = false;
          this.exported = res.data;
          //alert(res.data);
        });
    },
    downloadAll() {
      multiDownload(this.exported_urls);
    }
  }
};
</script>

<style>
</style>

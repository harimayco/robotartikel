<template>
  <div class="main">
    <h1>Artikel Generator</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <input
            type="file"
            accept=".csv"
            id="file-upload"
            @change="handleFileUpload"
            label="Upload File (CSV)"
            ref="fileInput"
          />
          <v-btn color="primary" @click="submitUpload" class="float-right">Upload!</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-card>
      <v-card-title>
        Uploaded Files
        <div class="flex-grow-1"></div>
        <v-text-field
          v-model="search"
          append-icon="mdi-table-search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :loading="loading"
        :headers="headers"
        :items-per-page="10"
        :sort-by="['date']"
        :sort-desc="[true]"
        :items="items"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:item.export="{ item }">
          <v-icon small class="mdi mdi-blogger" @click="generate(item.name, 'blogger')"></v-icon>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <v-icon small class="mdi mdi-wordpress" @click="generate(item.name, 'wordpress')"></v-icon>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mdi mdi-trash-can" @click="deleteItem(item)"></v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Generate {{ this.$route.params.platform }}</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-toolbar-items>
            <v-btn dark text @click="closeDialog">Close</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <blogspot-generator
          v-if="fileName"
          v-bind:platform="$route.params.platform"
          v-bind:file-name="fileName"
          :key="fileName"
        ></blogspot-generator>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BlogspotGenerator from "~/components/BlogspotGenerator.vue";
export default {
  components: {
    BlogspotGenerator
  },
  loading: true,

  data() {
    return {
      fileName: null,
      dialog: false,
      file: null,
      loading: true,
      search: "",
      formData: "",
      headers: [
        {
          text: "File Name",
          value: "name"
        },
        {
          text: "Size",
          value: "size"
        },
        {
          text: "Tanggal Upload",
          value: "date"
        },
        {
          text: "Generate",
          value: "export",
          sortable: false
        },
        {
          text: "Aksi",
          value: "action",
          sortable: false
        }
      ],
      items: []
    };
  },
  mounted() {
    this.formData = new FormData();
    if (this.$route.params.platform && this.$route.params.filename) {
      if (process.browser) {
        this.fileName = this.$route.params.filename;
        this.dialog = true;
      }
    }
    this.refreshFiles();
  },
  created() {},
  methods: {
    closeDialog() {
      this.dialog = false;
      this.$router.push("/artikel-generator");
    },
    generate(name, platform = "blogger") {
      this.$router.push("/artikel-generator/" + platform + "/" + name);
      this.fileName = name;
      this.dialog = true;
    },
    editItem() {},
    deleteItem() {},
    refreshFiles() {
      this.loading = true;
      var data = this.$axios.get("/api/get-uploaded-files").then(res => {
        this.loading = false;
        this.items = res.data;
      });
    },
    submitUpload() {
      this.$axios
        .post("/api/upload", this.formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(() => {
          //alert("Success!");
          this.formData = new FormData();

          this.refreshFiles();
        })
        .catch(() => {
          alert("failure");
        });
    },
    handleFileUpload(e) {
      var self = this;
      var files = e.target.files || e.dataTransfer.files;
      if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          self.formData.append("file", files[i], files[i].name);
        }
      }
    },
    deleteItem(item) {
      const conf = confirm("Are you sure want to delete this item?");
      if (conf) {
        this.$axios.delete("/api/delete/upload/" + item.name).then(response => {
          //alert(response.data);
          this.refreshFiles();
        });
      }
    }
  }
};
</script>

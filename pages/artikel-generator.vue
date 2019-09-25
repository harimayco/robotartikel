<template>
  <div class="main">
    <h1>Artikel Generator</h1>
    param = {{ $route.params.filename }} , {{ $route.params.platform }}
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
          <v-icon small class="mdi mdi-blogger" @click="editItem(item)"></v-icon>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <v-icon small class="mdi mdi-wordpress" @click="editItem(item)"></v-icon>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mdi mdi-trash-can" @click="deleteItem(item)"></v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  loading: true,
  data() {
    return {
      file: null,
      loading: true,
      search: "",
      formData: new FormData(),
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
    this.refreshFiles();
  },
  methods: {
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
          alert("Success!");
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

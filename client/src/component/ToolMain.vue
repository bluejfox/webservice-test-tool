<template>
  <ume-row :gutter="10">
    <ume-col :span="5">
      <div class="delete-all-button">
        <ume-button type="primary" @click="deleteAllHistory" style="width: 100%">删除所有</ume-button>
      </div>
      <ume-card class="service-history" :body-style="{ padding: '5px' }">
        <div v-for="s in serviceHistory" style="width: 100%" @click="selectHistoryItem(s)">
          <ume-row>
            <ume-col :span="20" class="service-history-item">
              <ume-row :gutter="5">
                <ume-col :span="16">
                  {{ s.serviceId }}
                </ume-col>
                <ume-col :span="8">
                  {{ s.serviceExecDate }}
                </ume-col>
              </ume-row>
            </ume-col>
            <ume-col :span="4" style="text-align: right;">
              <ume-button type="danger" icon="delete" size="mini" @click.stop="deleteHistoryItem(s)"></ume-button>
            </ume-col>
          </ume-row>
        </div>
      </ume-card>
    </ume-col>
    <ume-col :span="19">
      <ume-row :gutter="10">
        <ume-col :span="12">
          <div class="panel-block">
            <ume-tag type="gray" class="panel-title">输入</ume-tag>
            <ume-form label-width="80" :rules="rules" ref="inputForm" :model="inputForm" @submit="callService">
              <ume-form-item label="Service路径" prop="servicePath">
                <ume-input placeholder="http://localhost:8080/api/" v-model="inputForm.servicePath"></ume-input>
              </ume-form-item>
              <ume-form-item label="Service Id" prop="serviceId">
                <ume-input placeholder="XXX00001" v-model="inputForm.serviceId">
                </ume-input>
              </ume-form-item>
              <ume-form-item label="输入数据" prop="input">
                <json-editor mode="code" v-model="inputForm.input" modes="form,code" class="input-json-editor"></json-editor>
              </ume-form-item>
              <ume-form-item>
                <ume-button type="primary" size="large" native-type="submit">执行</ume-button>
              </ume-form-item>
            </ume-form>
          </div>
        </ume-col>
        <ume-col :span="12">
          <div class="panel-block">
            <ume-tag type="success" class="panel-title">输出</ume-tag>
            <json-editor mode="view" class="output-json-editor" modes="view,code" v-model="output"></json-editor>
          </div>
        </ume-col>
      </ume-row>
    </ume-col>
  </ume-row>

</template>
<script>
import JsonEditor from './JSONEditor'
import Http from '../model/Http'
import Storage, { STORAGE_TYPE } from '../model/Storage'
import Util from '../model/Util'

const HISTORY_KEY = '__service_history_list'
const SETTING_KEY = '__service_setting'

export default {
  data () {
    return {
      rules: {
        servicePath: [
          {
            required: true,
            message: '请输入Service路径',
            trigger: 'blur'
          }
        ],
        serviceId: [
          {
            required: true,
            message: '请输入Service ID',
            trigger: 'blur'
          }
        ]
      },
      inputForm: {
        servicePath: '',
        serviceId: '',
        input: {
        }
      },
      output: {
      },
      token: '',
      serviceSetting: Storage.getItem(STORAGE_TYPE.LOCAL, SETTING_KEY),
      serviceHistory: Storage.getItem(STORAGE_TYPE.LOCAL, HISTORY_KEY) || []
    }
  },
  computed: {
  },
  watch: {
    serviceHistory: {
      deep: true,
      handler (val) {
        Storage.setItem(STORAGE_TYPE.LOCAL, HISTORY_KEY, val)
      }
    }
  },
  methods: {
    callService (formName) {
      this.updateHistory(this.inputForm)
      // if (this.inputForm.input.params) {
      //   this.inputForm.input = this.inputForm.input.params
      // }
      const target = this.inputForm.servicePath + this.inputForm.serviceId
      const url = `${Util.getConfigValue('PROXY_KEY')}/proxy`
      const config = {
        params: {
          target
        }
      }
      if (this.isTokenAuthType() && !Util.isEmpty(this.token)) {
        if (Util.isEmpty(config.headers)) {
          config.headers = {}
        }
        config.headers[this.serviceSetting.tokenId] = this.token
      }
      console.log(config)
      Http.post(url, this.inputForm.input, config)
        .then(res => {
          if (this.isTokenAuthType()) {
            const tokenId = this.serviceSetting.tokenId
            if (!Util.isEmpty(tokenId)) {
              this.token = res.headers[tokenId]
            }
          }
          this.output = res.data
        }).catch(res => {
          this.$root.handleError(res)
        })
    },
    isTokenAuthType () {
      return this.serviceSetting.serviceAuthType === 2
    },
    updateHistory (serviceObj) {
      let obj = Util.cloneDeep(serviceObj)
      obj.serviceExecDate = Util.getNow('MM/DD')
      this.serviceHistory.push(obj)
    },
    deleteHistoryItem (item) {
      this.serviceHistory.some((v, i) => {
        if (Util.isEqual(v, item)) {
          this.serviceHistory.splice(i, 1)
          return true
        }
      })
    },
    selectHistoryItem (item) {
      let obj = Util.cloneDeep(item)
      this.inputForm = obj
    },
    deleteAllHistory () {
      this.serviceHistory = []
    }
  },
  components: {
    JsonEditor
  }
}
</script>

<style scoped>
  .service-history {
    font-size: 13px;
    height: 473px;
    overflow-y: auto;
  }
  .delete-all-button {
    width: 100%;
    margin-bottom: 10px;
  }
  .service-history-item {
    cursor: pointer;
    margin: 5px 0;
    word-break: break-all;
  }
  .service-history-item:hover {
    background: #e4e8f1;
  }
  .panel-block {
    height: 510px;
    padding: 5px;
  }
  .panel-title {
    font-size: 18px;
    font-weight: 700;
    width: 100%;
    text-align: center;
  }
  .panel-block {
    border: 1px solid #eaeefb;
    border-radius: 4px;
    transition: .2s;
  }
  .panel-block.hover {
    box-shadow: 0 0 8px 0 rgba(232,237,250,.6),0 2px 4px 0 rgba(232,237,250,.5)
  }
  .h3 {
    font-size: 16px;
  }
  .input-json-editor {
  }
  .output-json-editor {
    margin-top: 10px;
    height: 470px;
  }

</style>

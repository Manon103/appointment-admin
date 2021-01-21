<!--医生点击的某个患者的查看时跳进来查看患者以往的病历-->
<template>
    <div>
        <!--    顶部的个人信息框框-->
        <section class="out-border" v-loading="isLoading">
            <div class="top-text">
                <div class="text-box">
                    <span>姓名：</span>
                    <span class="gray-text">{{ patientData.name }}</span>
                </div>
                <div class="text-box">
                    <span>就诊卡号：</span>
                    <span class="gray-text">{{ cardId }}</span>
                </div>
                <div class="text-box">
                    <span>就诊医院：</span>
                    <span class="gray-text">{{
                        patientData.hospitalName
                    }}</span>
                </div>
            </div>
            <div class="top-text">
                <div class="text-box">
                    <span>就诊日期：</span>
                    <span class="gray-text">{{
                        patientData.day | getTreatTimeNoon
                    }}</span>
                </div>
                <div class="text-box">
                    <span>就诊专科/门诊：</span>
                    <span class="gray-text"
                        >{{ patientData.specialName }} /
                        {{ patientData.outpatientName }}</span
                    >
                </div>
            </div>
        </section>
        <div class="data-list">
          <el-collapse v-model="activeRecord">
            <el-collapse-item v-for="item in contentList" :key="item.appointmentId" :title="item.day | dateTime('date')" :name="item.appointmentId">
              <el-button type="text" class="btn" :disabled="item.doctorName !== doctorId" @click="operate(item)">编辑</el-button>
              <pre class="record-text">{{item.userCase ? item.userCase.content : '暂无数据'}}</pre>
              <div class="doctor-box">
                <span>医生：</span>
                <span class="doctor-name">{{item.doctorName}}</span>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <!--    点击添加新病历弹出的框-->
        <el-dialog
            title="添加新病历"
            :visible.sync="dialogFormVisible"
            width="35%"
            @close="cancelModal"
            v-loading="isLoading"
        >
            <el-form>
                <!--        <el-form-item label="专科名称：" label-width="120px">-->
                <el-input
                    type="textarea"
                    placeholder="请输入内容"
                    v-model="medicalRecord"
                    class="brief"
                    maxlength="1000"
                    :autosize="{ minRows: 2, maxRows: 6 }"
                    show-word-limit
                >
                </el-input>
                <!--        </el-form-item>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelModal">取 消</el-button>
                <el-button type="primary" @click="addPatientCase()"
                    >确 定</el-button
                >
            </div>
        </el-dialog>

        <!--    修改病历-->
        <el-dialog
            title="修改病历"
            :visible.sync="dialogUpdateVisible"
            width="35%"
            @close="cancelModal"
            v-loading="isLoading"
        >
            <el-form>
                <!--        <el-form-item label="专科名称：" label-width="120px">-->
                <el-input
                    type="textarea"
                    placeholder="请输入内容"
                    v-model="updateCase"
                    class="brief"
                    maxlength="1000"
                    :autosize="{ minRows: 2, maxRows: 6 }"
                    show-word-limit
                >
                </el-input>
                <!--        </el-form-item>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelModal">取 消</el-button>
                <el-button type="primary" @click="updatePatientCase()"
                    >确 定</el-button
                >
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    getPatientTreatRecord,
    getTreatRecordCase,
    addPatientCase,
    updatePatientCase,
} from "@/api/patient";
import { getCookie } from "@/utils/cookies";
import { tips } from "@/common/js/optionTips";
import { dateFormYMD } from "@/common/js/dateFormYMD";
import { getTreatRecord, getTreatRecordDetail } from '@/api/outCall.js'

export default {
    name: "show2",
    data() {
        return {
            dialogFormVisible: false,
            medicalRecord: "",
            cardId: 0,
            patientData: {},
            patientCase: "",
            appointId: 0,
            isLoading: false,
            isTodayCase: false, // 是否已经写了今天的就诊病历
            updateCase: "", // 修改病历
            dialogUpdateVisible: false,
            page: 1,
            // dataLength: 0
            activeRecord: "1",
            contentList: [],
            doctorId: '',
            caseId: ''
        };
    },
    methods: {
        // 上一页
        goLastPage: function () {
            this.page = this.page - 1;
            this.getPatientTreatRecord();
        },
        // 下一页
        goNextPage: function () {
            this.page = this.page + 1;
            this.getPatientTreatRecord();
        },
        // 关闭模态框
        cancelModal: function () {
            this.dialogFormVisible = false;
            this.dialogUpdateVisible = false;
        },
        // 获取患者就诊记录
        getPatientTreatRecord: function () {
            this.isLoading = true;
            getPatientTreatRecord(this.cardId, this.page, 1).then((res) => {
                if (res.code === 200) {
                    if (res.data.list !== null) {
                        this.dataLength = res.data.list.length;
                        this.patientData = res.data.list[0];
                        this.isLoading = false;
                    } else {
                        this.isLoading = false;
                        tips("error", "无数据");
                    }
                }
            });
        },
        // 添加新病历
        addPatientCase: function () {
            this.isLoading = true;
            const userId = JSON.parse(sessionStorage.getItem("doctorInfo")).id;
            addPatientCase({
                appointmentId: this.appointId,
                cardId: this.cardId,
                content: this.medicalRecord,
                doctorId: userId,
            })
                .then((res) => {
                    if (res.code === 200) {
                        this.isLoading = false;
                        tips("success", "添加病历成功");
                        this.dialogFormVisible = false;
                        this.getPatientTreatRecord();
                        this.getAllAppointId(this.appointId);
                    }
                })
                .catch(() => {
                    this.isLoading = false;
                    tips("error", "添加病历失败");
                });
        },
        // 修改病历
        updatePatientCase: function () {
            this.isLoading = true;
            updatePatientCase(
                this.caseId,
                {
                    content: this.updateCase,
                },
                this.cardId
            ).then((res) => {
                if (res.code === 200) {
                    this.isLoading = false;
                    tips("success", "修改病历成功");
                    this.dialogUpdateVisible = false;
                    this.getAllAppointId(this.appointId);
                }
            });
        },
        // 获取所有预约id后对应获取病历内容
        getAllAppointId(id){
            this.contentList = [];
            getTreatRecord(this.cardId, 1, 100).then(res => {
              if(res.code === 200 && res.data){
                res.data.list.forEach(item => {
                  getTreatRecordDetail(item.appointmentId).then((res) => {
                      if (res.code === 200) {
                        this.contentList.push(res.data);
                        // 默认展开病历
                        this.activeRecord = id ? id : this.contentList[0].appointmentId;
                        console.log(this.contentList[0])
                      }
                  });
                })
              }
            })
        },
        operate(data){
          this.appointId = data.appointmentId;
          if(data.userCase){
            this.dialogUpdateVisible = true;
            this.updateCase = data.userCase.content;
            this.caseId = data.userCase.id;
          }else{
            this.dialogFormVisible = true;
            this.medicalRecord = '';
          }
        }
    },
    created() {
        this.cardId = this.$route.query.ID;
        this.appointId = this.$route.query.appointId;
        this.getPatientTreatRecord();
        this.getAllAppointId();
        this.doctorId = JSON.parse(sessionStorage.getItem("doctorInfo")).name;
    },
};
</script>

<style lang="scss">
.data-list {
  margin-top: 20px;
  .el-collapse-item {
    position: relative;
    border-left: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    .btn {
      position: absolute;
      top: 4px;
      right: 30px;
    }
  }
  .el-collapse {
    border-top: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6 ;
  }
  .el-collapse-item__wrap {
    border-bottom: 1px solid #dee2e6 ;
  }
  .el-collapse-item__header{
    color: #4270a8;
    background: #f8f9fa;
    border-color: #dee2e6;
    border-bottom: 1px solid #dee2e6;
  }
  .el-collapse-item__header,
  .el-collapse-item__content {
    padding-left: 10px
  }
}
</style>

<style scoped lang="scss">
@import "../../../common/scss/common";
.record-text {
  text-align: left;
  white-space: pre-wrap;
}
.doctor-box {
    margin-right: 20px;
    margin-top: 20px;
    @include font-style(14px, #6d7c8b);
    text-align: right;
    .doctor-name {
        margin-left: 10px;
        color: #34495e;
    }
}
.out-border {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 10px 10px;
    /*顶部的个人信息处*/
    .top-text {
        @include width-margin(90%, 50px);
        line-height: 50px;
        @include flex-direction(row);
        .text-box {
            width: 33%;
            @include font-style(14px, #6d7c8b);
            text-align: left;
            .gray-text {
                @include font-style(14px, #34495e);
                margin-left: 10px;
            }
        }
    }
    /*底部的病历*/
    .medical-record-out-box {
        @include width-margin(100%, 250px);
        @include flex-direction(column);
        text-align: left;
        .record-text {
            @include width-margin(95%, 230px);
            text-align: left;
        }
        /*医生签名*/
        
    }
}
/*中间的简历日期和添加新按钮的病历*/
.date-button-box {
    @include width-margin(90%, 50px);
    line-height: 50px;
    @include flex-direction(row);
    justify-content: space-between;
    margin-top: 30px;
    .title-text {
        width: 40%;
        @include flex-direction(row);
        .title {
            color: $major-blue-color;
        }
        .grey-text {
            color: $gray-text-color;
            margin-left: 10px;
        }
    }
    .button {
        width: 100px;
        height: 40px;
    }
}
/*底部左右箭头*/
.icon-box {
    @include width-margin(100px, auto);
    display: flex;
    vertical-align: center;
    margin-top: 10px;
    .img-icon {
        @include icon-style(25px, 25px);
        margin-right: 30px;
    }
}
</style>


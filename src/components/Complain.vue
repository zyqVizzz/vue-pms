<template>
  <div class="complain position-right">
    <div class="g-table-banner">
      <v-more-panel class="p-v-lg p-h-md">
        <v-form slot="form">
          <v-form-item label="投诉人" class="m-b-sm">
            <v-input v-model="filterList.proposerName" placeholder="请输入投诉人姓名" style="width: 240px;"></v-input>
          </v-form-item>
          <v-form-item label="投诉时间" class="m-b-sm">
            <v-date-picker v-model="filterList.startTime" :disabled-date="disabledStartDate"></v-date-picker>
            <span>-</span>
            <v-date-picker v-model="filterList.endTime" :disabled-date="disabledEndDate"></v-date-picker>
          </v-form-item>
          <v-form-item label="联系方式" class="m-b-sm">
            <v-input v-model="filterList.proposerMobile" placeholder="请输入联系方式" style="width: 240px;"></v-input>
          </v-form-item>
          <v-form-item label="处理状态" class="m-b-sm">
            <v-select v-model="filterList.status" style="width: 120px;" :data="statusOption"></v-select>
          </v-form-item>
        </v-form>
        <v-button slot="control" type="primary" html-type="button" icon="search" style="margin-right:10px" @click="filterTable">
          查询
        </v-button>
        <v-button slot="control" type="ghost" @click="resetTable">
          重置
        </v-button>
      </v-more-panel>

    </div>
    <div class="g-table-content m-t-sm m-b-md p-h-md p-v-sm">
      <v-table>
        <table class="wk-table" style="table-layout:fixed;">
          <thead class="ant-table-thead">

          <tr>
            <th width="10%">投诉人</th>
            <th width="15%">联系方式</th>
            <th width="24%">地址</th>
            <th width="14%">投诉时间</th>
            <th width="14%">处理时间</th>
            <th width="11%">处理状态</th>
            <th width="12%">操作</th>
          </tr>
          </thead>
          <tbody class="ant-table-tbody">
          <tr v-for="item in complainList">
            <td>{{item.proposerName}}</td>
            <td>{{item.proposerMobile}}</td>
            <td>{{item.location}}</td>
            <td>{{item.gmtCreated | formatDate('YMD') }}</td>
            <td>{{item.processTime | formatDate('YMD')}}</td>
            <td>
              <span class="state-circle"
                    :class="{'circle-red': item.status == '未处理',
                             'circle-green': item.status == '已处理',
                             'circle-orange': item.status == '处理中'}">
                      </span>
              {{item.status}}
            </td>
            <td>
              <v-popconfirm placement="left"
                            title="确定处理这条投诉消息吗?"
                            @confirm="dealComplain(item.id)">
                <a href="javascript:;" class="m-r-xs" :disabled="item.status == '已处理'">处理</a>
              </v-popconfirm>
              <a href="javascript:;" class="m-r-xs"
                 @click="showModal('detail', item.id)">
                详情
              </a>
            </td>
          </tr>
          <div style="width: 100%;height: 20px;"></div>
          </tbody>
        </table>
      </v-table>

      <v-pagination class="m-t-md m-b-md"
                    v-model="page.value"
                    :pageSize="10"
                    :showTotal="showTotal"
                    @change="loadPage"
                    show-quick-jumper
                    ref="pagination"
                    :total="page.total">
      </v-pagination>
    </div>

    <div class="g-modal">
      <v-modal title="投诉详情"
               :visible="modalVisible.detail"
               :width="600"
               @cancel="handleCancel('detail')">
        <complain-detail :id="idParam" ref="complainDetailRef"></complain-detail>
        <div slot="footer">
          <v-button key="confirm"
                    type="primary"
                    @click="handleCancel('detail')">
            确 定
          </v-button>
        </div>
      </v-modal>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>
<script>
  import api from '../fetch/api'
  import { checkFilter } from '../util/option'
  import ComplainDetail from '@/components/ComplainDetail'
  import vTable from '@/components/table'
  export default{
    data(){
      return{
        filterList:{
          startTime: "",
          endTime: ""
        },
        statusOption: [{
          value: '0',
          label: '未处理'
        }, {
          value: '2',
          label: '已处理'
        }],
        page: {
          total: 0,
          value: 1
        },
        complainList: [],
        modalVisible:{
          detail: false
        },
        idParam: ""
      }
    },
    components:{
      ComplainDetail,
      vTable
    },
    methods:{
      showTotal(total){
        return `全部 ${total} 条`;
      },
      showModal(value, param){
        this.idParam = param;
        this.modalVisible[value] = true;
      },
      handleCancel (value) {
        this.modalVisible[value] = false;
      },
      filterTable(){
        var newObj = checkFilter(this.filterList);
        if(newObj.startTime&&newObj.endTime){
          newObj.startTime = Date.parse(new Date(newObj.startTime));
          newObj.endTime = Date.parse(new Date(newObj.endTime))+ 24 * 60 * 60 * 1000 - 1000;
        }
        this._getComplaint(1, newObj)
      },
      resetTable(){
        this.filterList = {
          startTime: "",
          endTime: ""
        };
        this._getComplaint(1, {type: 0});
      },
      disabledStartDate(current){
        return current && current.valueOf() > Date.parse(new Date(this.filterList.endTime));
      },
      disabledEndDate(current){
        return current && current.valueOf() < Date.parse(new Date(this.filterList.startTime));
      },
      loadPage(i){
        this._getComplaint(i, this.filterList)
      },
      dealComplain(id){
        var timeStr = new Date().getTime();
        api.dealComplaint(id, timeStr)
          .then(res => {
            if(res.success){
              this.$notification.success({
                message: '处理成功！',
                duration: 2
              });
              this.loadPage(this.$refs.pagination.value)
            }else{
              this.$notification.error({
                message: res.message,
                duration: 2
              });
            }
          })
      },
      _getComplaint(pageNo, params){
        api.getComplaint(pageNo, 10, params)
          .then(res => {
            console.log(res);
            if(res.success){
              if(res.data.list){
                for (var i = 0; i < res.data.list.length; i++) {
                  switch (res.data.list[i].status) {
                    case 0:
                      res.data.list[i].status = '未处理';
                      break;
                    case 1:
                      res.data.list[i].status = '处理中';
                      break;
                    case 2:
                      res.data.list[i].status = '已处理';
                      break;
                    default:
                      res.data.list[i].status = '';
                  }
                }
                this.page.total = res.data.total;
                this.complainList = res.data.list;
              }
            }
          })
      }
    },
    created(){
      document.title = '投诉管理';
      this._getComplaint(1, {type:0});

    }

  }
</script>

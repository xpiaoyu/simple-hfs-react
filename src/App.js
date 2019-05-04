import React from 'react';
import './App.css';
import { observer } from 'mobx-react';
import { decorate, observable, autorun, computed } from 'mobx';
import axios from 'axios'
import FileList from "./FileList";

import { Layout, TreeSelect, Button, Row, Col, AutoComplete, Spin } from 'antd';
// import Layout from 'antd/lib/layout';
// import TreeSelect from 'antd/lib/tree-select';
// import Button from 'antd/lib/button';
// import Row from 'antd/lib/row';
// import Col from 'antd/lib/col';
// import AutoComplete from 'antd/lib/auto-complete';
// import Spin from 'antd/lib/spin';
import Constant from './constant.js';

const { Header, Footer } = Layout;

//128.1.224.193

class TreeDataModel {
  constructor() {
    const node1 = {
      title: '/',
      value: '/',
      key: '/',
    };

    this.loading = true;
    this.data = [node1];
    this.treeData = this.data;
    this.nodeMap = new Map();
    this.nodeMap.set('/', node1);
    this.loadTreeData('/').then(() => {
      this.setSelectedValue('/');
    });

    this.listData = [];
    this.expandedKeys = ['/'];
    this.valueHistory = [];
    this.keywords = '';
    this.autoCompleteKw = '';

    autorun(() => {
      const value = this.selectedValue;
      console.log('value:', value);
      console.log('tree data:', this.data);
      this.clearKeywords();
      this.loadListData(value);
    });
  }

  loadListData(value) {
    this.loading = true;
    axios.get(Constant.APP_URL + '/list?path=' + value).then((resp) => {
      console.log('response data:', resp.data);
      if (resp.data) {
        this.listData = resp.data;
      } else {
        treeDataModel.listData = [];
      }
      this.loading = false;
    });
  }

  compareFunc(item1, item2) {
    return -1;
  };

  sortListData(listData) {
    listData.sort(this.compareFunc);
  }

  setKeywords(k) {
    this.keywords = k;
  }

  getNode(nodeValue) {
    return this.nodeMap.get(nodeValue);
  }

  addChildToNode(child, nodeValue) {
    if (this.nodeMap.get(nodeValue).children) {
      this.nodeMap.get(nodeValue).children.push(child);
    } else {
      this.nodeMap.get(nodeValue).children = [child];
    }
  }

  refreshTreeData() {
    this.treeData = this.data;
  }

  setSelectedValue(value) {
    this.selectedValue = value;
    this.valueHistory.push(value);
  }

  get filteredListData() {
    return this.listData.filter((item) => item.Name.indexOf(this.keywords) > -1);
  }

  get autoCompleteData() {
    const data = [];
    this.listData.filter((item) => !item.IsDir).filter((item) => item.Name.indexOf(this.autoCompleteKw) > -1).forEach((item) => {
      data.push(item.Name);
    });
    return data;
  }

  goBack() {
    let pre = this.valueHistory.pop();
    if (pre) {
      pre = this.valueHistory[this.valueHistory.length - 1];
    }
    if (pre) {
      console.log('pre value:', pre);
      this.selectedValue = pre;
    } else {
      this.selectedValue = '/';
    }
  }

  pushExpandedKey(key) {
    this.expandedKeys.push(key);
    console.log('expanded key:', key, 'keys:', this.expandedKeys);
  }

  clearKeywords() {
    this.autoCompleteKw = '';
    this.keywords = '';
  }

  loadTreeDataByList(childValue) {
    treeDataModel.loadTreeData(childValue).then(() => {
      treeDataModel.setSelectedValue(childValue);
      treeDataModel.pushExpandedKey(childValue);
    });
  }

  loadTreeData(currentValue) {
    const currentNode = this.getNode(currentValue);
    console.log('currentValue&Node:', currentValue, currentNode);
    if (currentNode && currentNode.children) {
      return Promise.resolve(null);
    }
    return axios.get(Constant.APP_URL + '/list?path=' + currentValue).then((resp) => {
      console.log('response:', resp);
      if (resp.data) {
        resp.data.filter((file) => file.IsDir).forEach(file => {
          const value = currentValue + file.Name + '/';
          const newNode = {
            title: file.Name,
            value: value,
            key: value,
          };
          treeDataModel.nodeMap.set(value, newNode);
          treeDataModel.addChildToNode(newNode, currentValue);
        });
        if (treeDataModel.getNode(currentValue) && !treeDataModel.getNode(currentValue).children) {
          treeDataModel.getNode(currentValue).children = [];
        }
        treeDataModel.refreshTreeData();
      }
    });
  }
}

decorate(TreeDataModel, {
  treeData: observable,
  selectedValue: observable,
  listData: observable,
  expandedKeys: observable,
  filteredListData: computed,
  keywords: observable,
  autoCompleteData: computed,
  autoCompleteKw: observable,
  loading: observable,
});

const treeDataModel = new TreeDataModel();

class App extends React.Component {
  onChange = (value, label, extra) => {
    console.log(value, label, extra);
    treeDataModel.setSelectedValue(value);
  };

  loadData = (node) => {
    console.log(node.props);
    return treeDataModel.loadTreeData(node.props.value);
  };

  clickButton = () => {
    treeDataModel.goBack();
  };

  onInputChange = (e) => {
    console.log(e.target.value);
    treeDataModel.setKeywords(e.target.value);
  };

  onAutoCompleteChange = (v) => {
    // if (v === '') {
    //   treeDataModel.setKeywords('');
    //   return
    // }
    // if (treeDataModel.autoCompleteKw !== v) {
    //   console.log('ac change:', v);
    //   treeDataModel.autoCompleteKw = v;
    // }
    if (v) {
      treeDataModel.autoCompleteKw = v;
      treeDataModel.keywords = v;
    } else {
      treeDataModel.clearKeywords();
    }
  };

  // onAcSelect = (e) => {
  //   console.log('ac select:', e);
  //   treeDataModel.setKeywords(e);
  // };

  render() {
    return (
      <div className="App">
        {/* <Spin spinning={treeDataModel.loading}> */}
        <Spin spinning={false}>
          <Layout>
            <Header>Header</Header>
            <Layout style={{ margin: '10px' }}>
              <div style={{ textAlign: 'left' }}>
                <Row>
                  <Col xs={0} sm={2} md={4} lg={4} />
                  <Col xs={24} sm={20} md={16} lg={16}>
                    <div className="input_keywords">
                      <p>当前路径：{treeDataModel.selectedValue}</p>
                    </div>
                  </Col>
                  <Col xs={0} sm={2} md={4} lg={4} />
                </Row>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Row gutter={2}>
                  <Col xs={0} sm={2} md={4} lg={4} />
                  <Col className="gutter-row" xs={20} sm={16} md={14} lg={14}>
                    <TreeSelect
                      showSearch
                      style={{ width: '100%' }}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      treeData={treeDataModel.treeData}
                      placeholder="Please select"
                      onChange={this.onChange}
                      loadData={this.loadData}
                      value={treeDataModel.selectedValue}
                      treeDefaultExpandedKeys={treeDataModel.expandedKeys}
                    />
                  </Col>
                  <Col className="gutter-row" xs={4} sm={4} md={2} xl={2}>
                    <div className="button_return">
                      <Button onClick={this.clickButton} style={{ width: '100%', padding: 0 }}>返回</Button>
                    </div>
                  </Col>
                  <Col xs={0} sm={2} md={4} lg={4} />
                </Row>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Row>
                  <Col xs={0} sm={2} md={4} lg={4} />
                  <Col xs={24} sm={20} md={16} lg={16}>
                    <div className="input_keywords">
                      {/*<Input placeholder="文件名关键词" allowClear*/}
                      {/*onChange={this.onInputChange}/>*/}
                      <AutoComplete
                        style={{ width: '100%' }}
                        dataSource={treeDataModel.autoCompleteData}
                        placeholder="在当前目录查找文件"
                        onChange={this.onAutoCompleteChange}
                        allowClear
                        value={treeDataModel.autoCompleteKw}
                      // onSelect={this.onAcSelect}
                      />
                    </div>
                  </Col>
                  <Col xs={0} sm={2} md={4} lg={4} />
                </Row>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Row>
                  <Col xs={0} sm={2} md={4} lg={4} />
                  <Col xs={24} sm={20} md={16} lg={16}>
                    <div className="file-list">
                      <FileList treeDataModel={treeDataModel} />
                    </div>
                  </Col>
                  <Col xs={0} sm={2} md={4} lg={4} />
                </Row>
              </div>
            </Layout>
            <Footer>Footer</Footer>
          </Layout>
        </Spin>
      </div>
    );
  }
}

observer(App);

export default App;

import React from 'react';
import Layout from 'antd/lib/layout';
import TreeSelect from 'antd/lib/tree-select';
import Button from 'antd/lib/button';
import './App.css';
import {observer} from 'mobx-react';
import {decorate, observable, autorun} from 'mobx';
import axios from 'axios'
import FileList from "./FileList";

const {Header, Footer} = Layout;

class TreeDataModel {
  constructor() {
    const node1 = {
      title: 'ROOT',
      value: '/',
    };

    this.data = [node1];
    this.treeData = this.data;
    this.nodeMap = new Map();
    this.nodeMap.set("/", node1);
    this.selectedValue = '/';

    this.listData = [];

    autorun(() => {
      const value = this.selectedValue;
      axios.get("http://localhost:8082/list?path=" + value).then((resp) => {
        console.log('response data:', resp.data);
        if (resp.data) {
          treeDataModel.listData = resp.data;
        } else {
          treeDataModel.listData = [];
        }
      });
    });
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
    this.treeData = this.data;
  }

  setSelectedValue(value) {
    this.selectedValue = value;
  }
}

decorate(TreeDataModel, {
  treeData: observable,
  selectedValue: observable,
  listData: observable,
});

const treeDataModel = new TreeDataModel();

class App extends React.Component {
  onChange = (value, label, extra) => {
    console.log(value, label, extra);
    treeDataModel.selectedValue = value;
  };

  loadData = (node) => {
    console.log(node.props);
    return axios.get("http://localhost:8082/list?path=" + node.props.value).then((resp) => {
      console.log('response:', resp);
      if (resp.data) {
        resp.data.filter((file) => file.IsDir).forEach(file => {
          const value = node.props.value + file.Name + '/';
          const newNode = {
            title: file.Name,
            value: value,
          };
          treeDataModel.nodeMap.set(value, newNode);
          treeDataModel.addChildToNode(newNode, node.props.value);
        });
      }
    });
  };

  clickButton = () => {
    treeDataModel.selectedValue = '/movie/';
  };

  render() {
    return (
      <div className="App">
        <Layout>
          <Header>Header</Header>
          <Layout>
            <div style={{margin: '10px'}}>
              <TreeSelect
                showSearch
                style={{width: '100%'}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                treeData={treeDataModel.treeData}
                placeholder="Please select"
                onChange={this.onChange}
                loadData={this.loadData}
                value={treeDataModel.selectedValue}
              />
            </div>
            <FileList treeDataModel={treeDataModel}/>
            <Button onClick={this.clickButton}>选中 Movie 目录</Button>
          </Layout>
          <Footer>Footer</Footer>
        </Layout>
      </div>
    );
  }
}

observer(App);

export default App;

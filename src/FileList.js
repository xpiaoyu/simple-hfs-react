import React from 'react';
import {observer} from "mobx-react/index";

import List from 'antd/lib/list';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';
import Upload from 'antd/lib/upload';
import message from 'antd/lib/message';
import Icon from 'antd/lib/icon';

import Constant from './constant.js';

class FileList extends React.Component {
  constructor(props) {
    super(props);
    this.treeDataModel = this.props.treeDataModel;
  }

  clickDirCard = (name) => {
    console.log(name);
    const treeDataModel = this.treeDataModel;
    const parentValue = treeDataModel.selectedValue;
    const childValue = parentValue + name + '/';
    this.treeDataModel.loadTreeDataByList(childValue);
  };

  getFileSize(size) {
    let unit = 'KB';
    size = size / 1024;
    if (size > 1024) {
      unit = 'MB';
      size = size / 1024;
    }
    if (size > 1024) {
      unit = 'GB';
      size = size / 1024;
    }
    if (size > 1024) {
      unit = 'TB';
      size = size / 1024;
    }
    return size.toFixed(2) + ' ' + unit;
  }

  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);

      this.treeDataModel.loadListData(this.treeDataModel.selectedValue);

      console.log('onChange this:', this);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  onClickDownload = (name) => {
    const filename = this.treeDataModel.selectedValue + name;
    console.log(filename);
    window.open(Constant.APP_URL + '/download?filename=' + filename);
  };

  render() {
    return (
      <>
        <div style={{marginBottom: '10px'}}>
          <Upload
            name="file"
            action={Constant.APP_URL + "/upload?path=" + this.treeDataModel.selectedValue}
            onChange={(info) => this.onChange(info)}
          >
            <Button>
              <Icon type=" upload"/> Click to Upload
            </Button>
          </Upload>
        </div>
        <List
          style={{textAlign: 'left', marginBottom: '10px'}}
          size=" small"
          header={<div>文件夹</div>}
          bordered
          dataSource={this.treeDataModel.filteredListData}
          renderItem={item => {
            if (item.IsDir) {
              return (
                <List.Item>
                  <Button onClick={() => {
                    this.clickDirCard(item.Name)
                  }} type="default" shape="circle" icon="folder" size="default"/>
                  <div className=" file-list-name">{item.Name}</div>
                </List.Item>
              );
            }
            return (<></>);
          }}
        />
        <List
          style={{textAlign: 'left', marginBottom: '10px'}}
          size=" small"
          header={<div>文件</div>}
          bordered
          dataSource={this.treeDataModel.filteredListData}
          renderItem={item => {
            if (item.IsDir === false) {
              return (<List.Item>
                <Button onClick={() => this.onClickDownload(item.Name)} type="default"
                        shape="circle" icon="download" size="default"/>
                <Tooltip title={item.Name}>
                  <div className=" file-list-name">{item.Name}</div>
                </Tooltip>
                <div className=" file-list-size">{this.getFileSize(item.Size)}</div>
              </List.Item>)
            }
            return (<></>);
          }}
        />
        {/*<List*/}
        {/*grid={{*/}
        {/*gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 6,*/}
        {/*}}*/}
        {/*itemLayout=" horizontal"*/}
        {/*dataSource={this.treeDataModel.filteredListData}*/}
        {/*renderItem={item => {*/}
        {/*return (*/}
        {/*<List.Item>*/}
        {/*{*/}
        {/*!item.IsDir ?*/}
        {/*<Card title={item.Name}>*/}
        {/*{'' + this.getFileSize(item.Size) + ' '}*/}
        {/*<Button type=" default" shape=" circle" icon=" download" size=" default"/>*/}
        {/*</Card> :*/}
        {/*<Card title={item.Name}>*/}
        {/*/!*<Icon  type=" folder" style={{fontSize: '20px'}} theme=" filled"/>*!/*/}
        {/*<Button onClick={() => {*/}
        {/*this.clickDirCard(item.Name)*/}
        {/*}} type=" default" shape=" circle" icon=" folder" size=" default"/>*/}
        {/*</Card>*/}
        {/*}*/}
        {/*</List.Item>*/}
        {/*);*/}
        {/*}}*/}
        {/*/>*/}
      </>
    );
  }
}

observer(FileList);

export default FileList;
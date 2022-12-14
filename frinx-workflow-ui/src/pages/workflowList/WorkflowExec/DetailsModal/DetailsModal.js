// @flow
import Clipboard from 'clipboard';
import moment from 'moment';
import React, { Component } from 'react';
import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { withRouter, Link } from 'react-router-dom';
import TaskModal from '../../../../common/TaskModal';
import './DetailsModal.css';
import WorkflowDia from './WorkflowDia/WorkflowDia';
import UnescapeButton from '../../../../common/UnescapeButton';
import { HttpClient as http } from '../../../../common/HttpClient';
import { GlobalContext } from '../../../../common/GlobalContext';

new Clipboard('.clp');

class DetailsModal extends Component {
  static contextType = GlobalContext;
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: true,
      meta: {},
      result: {},
      wfId: '',
      input: {},
      activeTab: null,
      status: 'Execute',
      timeout: null,
      parentWfId: '',
      inputsArray: [],
      taskDetail: {},
      taskModal: false,
      wfIdRerun: '',
    };
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  getData() {
    http.get(this.context.backendApiUrlPrefix + '/workflow/' + this.props.wfId).then(res => {
      let inputCaptureRegex = /workflow\.input\.([a-zA-Z0-9-_]+)\}/gim;
      let def = JSON.stringify(res);
      let match = inputCaptureRegex.exec(def);
      let inputsArray = [];

      while (match != null) {
        inputsArray.push(match[1]);
        match = inputCaptureRegex.exec(def);
      }

      inputsArray = [...new Set(inputsArray)];

      this.setState({
        meta: res.workflowName,
        result: res,
        subworkflows: res.subworkflows,
        input:
          {
            name: res.workflowName,
            version: res.workflowVersion,
            input: res.input,
          } || {},
        wfId: res.workflowId,
        parentWfId: res.parentWorkflowId || '',
        inputsArray: inputsArray,
      });

      if (this.state.result.status === 'RUNNING') {
        this.setState({
          timeout: setTimeout(() => this.getData(), 2000),
        });
      }
    });
  }

  handleClose() {
    this.setState({ show: false });
    this.props.modalHandler();
  }

  executeWorkflow() {
    this.setState({ status: 'Executing...' });
    http.post(this.context.backendApiUrlPrefix + '/workflow', JSON.stringify(this.state.input)).then(res => {
      this.setState({
        status: res.statusText,
        wfIdRerun: res.body.text,
      });
      setTimeout(() => {
        this.setState({ status: 'Execute' });
        this.props.refreshTable();
      }, 1000);
    });
  }

  handleInput(e, key) {
    let wfForm = this.state.input.input;
    if (!wfForm) wfForm = {};
    wfForm[key] = e.target.value;
    this.setState({
      input: {
        ...this.state.input,
        input: wfForm,
      },
    });
  }

  formatDate(dt) {
    console.log(dt);
    if (dt == null || dt === '' || dt === 0) {
      return '-';
    }
    return moment(dt).format('MM/DD/YYYY, HH:mm:ss:SSS');
  }

  execTime(end, start) {
    if (end == null || end === 0) {
      return '';
    }

    let total = end - start;

    return total / 1000;
  }

  taskTableData() {
    let dataset = this.state.result.tasks || [];

    return dataset.map((row, i) => {
      return (
        <tr key={`row-${i}`} id={`row-${i}`} className="clickable">
          <td>{row['seq']}</td>
          <td onClick={this.handleTaskDetail.bind(this, row)}>{row['taskType']}&nbsp;&nbsp;</td>
          <td style={{ textAlign: 'center' }}>
            {row['taskType'] === 'SUB_WORKFLOW' ? (
              <Button variant="primary" as={Link} to={`${this.context.frontendUrlPrefix}/exec/${row.subWorkflowId}`}>
                <i className="fas fa-arrow-circle-right" />
              </Button>
            ) : (
              ''
            )}
          </td>
          <td onClick={this.handleTaskDetail.bind(this, row)}>{row['referenceTaskName']}</td>
          <td>
            {this.formatDate(row['startTime'])}
            <br />
            {this.formatDate(row['endTime'])}
          </td>
          <td>{row['status']}</td>
        </tr>
      );
    });
  }

  handleTaskDetail(row) {
    this.setState({ taskDetail: row, taskModal: !this.state.taskModal });
  }

  terminateWfs() {
    http.delete(this.context.backendApiUrlPrefix + '/workflow/bulk/terminate', [this.state.wfId]).then(() => {
      this.getData();
    });
  }

  pauseWfs() {
    http.put(this.context.backendApiUrlPrefix + '/workflow/bulk/pause', [this.state.wfId]).then(() => {
      this.getData();
    });
  }

  resumeWfs() {
    http.put(this.context.backendApiUrlPrefix + '/workflow/bulk/resume', [this.state.wfId]).then(() => {
      this.getData();
    });
  }

  retryWfs() {
    http.post(this.context.backendApiUrlPrefix + '/workflow/bulk/retry', [this.state.wfId]).then(() => {
      this.getData();
    });
  }

  restartWfs() {
    http.post(this.context.backendApiUrlPrefix + '/workflow/bulk/restart', [this.state.wfId]).then(() => {
      this.getData();
    });
  }

  render() {
    const actionButtons = status => {
      switch (status) {
        case 'FAILED':
        case 'TERMINATED':
          return (
            <ButtonGroup style={{ float: 'right' }}>
              <Button onClick={this.restartWfs.bind(this)} variant="outline-light">
                <i className="fas fa-redo" />
                &nbsp;&nbsp;Restart
              </Button>
              <Button onClick={this.retryWfs.bind(this)} variant="outline-light">
                <i className="fas fa-history" />
                &nbsp;&nbsp;Retry
              </Button>
            </ButtonGroup>
          );
        case 'RUNNING':
          return (
            <ButtonGroup style={{ float: 'right' }}>
              <Button onClick={this.terminateWfs.bind(this)} variant="outline-light">
                <i className="fas fa-times" />
                &nbsp;&nbsp;Terminate
              </Button>
              <Button onClick={this.pauseWfs.bind(this)} variant="outline-light">
                <i className="fas fa-pause" />
                &nbsp;&nbsp;Pause
              </Button>
            </ButtonGroup>
          );
        case 'PAUSED':
          return (
            <ButtonGroup style={{ float: 'right' }}>
              <Button onClick={this.resumeWfs.bind(this)} variant="outline-light">
                <i className="fas fa-play" />
                &nbsp;&nbsp;Resume
              </Button>
            </ButtonGroup>
          );
        default:
          break;
      }
    };

    const headerInfo = () => (
      <div className="headerInfo">
        <Row>
          <Col md="auto">
            <div>
              <b>Total Time (sec)</b>
              <br />
              {this.execTime(this.state.endTime, this.state.startTime)}
            </div>
          </Col>
          <Col md="auto">
            <div>
              <b>Start Time</b>
              <br />
              {this.formatDate(this.state.startTime)}
            </div>
          </Col>
          <Col md="auto">
            <div>
              <b>End Time</b>
              <br />
              {this.formatDate(this.state.endTime)}
            </div>
          </Col>
          <Col md="auto">
            <div>
              <b>Status</b>
              <br />
              {this.state.status}
            </div>
          </Col>
          <Col>{actionButtons(this.state.status)}</Col>
        </Row>
      </div>
    );

    const taskTable = () => (
      <div className="heightWrapper">
        <Table className="tasktable" ref={this.table} size="sm" striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Task Type</th>
              <th style={{ width: '10px' }}>Subwf.</th>
              <th>Task Ref. Name</th>
              <th>Start/End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{this.taskTableData()}</tbody>
        </Table>
      </div>
    );

    const inputOutput = () => (
      <Row>
        <Col>
          <h4>
            Workflow Input&nbsp;&nbsp;
            <i title="copy to clipboard" className="clp far fa-clipboard clickable" data-clipboard-target="#wfinput" />
            &nbsp;&nbsp;
            <UnescapeButton size="tiny" target="wfinput" />
          </h4>
          <code>
            <pre id="wfinput" className="heightWrapper">
              {JSON.stringify(this.state.result.input, null, 2)}
            </pre>
          </code>
        </Col>
        <Col>
          <h4>
            Workflow Output&nbsp;&nbsp;
            <i title="copy to clipboard" className="clp far fa-clipboard clickable" data-clipboard-target="#wfoutput" />
            &nbsp;&nbsp;
            <UnescapeButton size="tiny" target="wfoutput" />
          </h4>
          <code>
            <pre id="wfoutput" className="heightWrapper">
              {JSON.stringify(this.state.result.output, null, 2)}
            </pre>
          </code>
        </Col>
      </Row>
    );

    const wfJson = () => (
      <div>
        <h4>
          Workflow JSON&nbsp;&nbsp;
          <i title="copy to clipboard" className="clp far fa-clipboard clickable" data-clipboard-target="#json" />
        </h4>
        <code>
          <pre id="json" className="heightWrapper" style={{ backgroundColor: '#eaeef3' }}>
            {JSON.stringify(this.state.result, null, 2)}
          </pre>
        </code>
      </div>
    );

    const editRerun = () => {
      let input = this.state.input.input || [];
      let iPam = this.state.meta.inputParameters || [];

      let labels = this.state.inputsArray;
      let values = [];
      labels.forEach(label => {
        let key = Object.keys(input).findIndex(key => key === label);
        key > -1 ? values.push(Object.values(input)[key]) : values.push('');
      });
      let descs = iPam.map(param => {
        if (param.match(/\[(.*?)]/)) return param.match(/\[(.*?)]/)[1];
        else return '';
      });
      return labels.map((label, i) => {
        return (
          <Col sm={6} key={`col1-${i}`}>
            <Form.Group>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type="input"
                placeholder="Enter the input"
                onChange={e => this.handleInput(e, labels[i])}
                value={values[i] ? (typeof values[i] === 'object' ? JSON.stringify(values[i]) : values[i]) : ''}
              />
              <Form.Text className="text-muted">{descs[i]}</Form.Text>
            </Form.Group>
          </Col>
        );
      });
    };

    const parentWorkflowButton = () => {
      if (this.state.parentWfId) {
        return (
          <Button
            style={{ margin: '2px', display: 'inline' }}
            onClick={() => this.props.history.push(`${this.context.frontendUrlPrefix}/exec/${this.state.parentWfId}`)}
          >
            Parent
          </Button>
        );
      }
    };

    return (
      <Modal dialogClassName="modalWider" show={this.state.show} onHide={this.handleClose}>
        <TaskModal
          task={this.state.taskDetail}
          show={this.state.taskModal}
          handle={this.handleTaskDetail.bind(this, {})}
        />
        <Modal.Header>
          <Modal.Title>
            Details of {this.state.meta.name ? this.state.meta.name : null} / {this.state.meta.version}
          </Modal.Title>
          <div>{parentWorkflowButton()}</div>
        </Modal.Header>
        <Modal.Body>
          <Card.Body style={{ padding: '0px' }}>{headerInfo()}</Card.Body>
          <Tabs
            className="heightWrapper"
            onSelect={e => this.setState({ activeTab: e })}
            style={{ marginBottom: '20px' }}
            id="detailTabs"
          >
            <Tab mountOnEnter eventKey="taskDetails" title="Task Details">
              {taskTable()}
            </Tab>
            <Tab mountOnEnter eventKey="inputOutput" title="Input/Output">
              {inputOutput()}
            </Tab>
            <Tab mountOnEnter eventKey="json" title="JSON">
              {wfJson()}
            </Tab>
            <Tab
              disabled={this.state.result.status === 'RUNNING'}
              mountOnEnter
              eventKey="editRerun"
              title="Edit & Rerun"
            >
              <h4>
                Edit & Rerun Workflow&nbsp;&nbsp;
                <i className="clp far fa-play-circle" />
              </h4>
              <div style={{ padding: '20px' }}>
                <Form>
                  <Row>{editRerun()}</Row>
                </Form>
              </div>
            </Tab>
            <Tab eventKey="execFlow" mountOnEnter title="Execution Flow">
              <WorkflowDia meta={this.state.meta} wfe={this.state.result} subworkflows={this.state.subworkflows} />
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <a
            style={{ float: 'left', marginRight: '50px' }}
            href={`${this.context.frontendUrlPrefix}/exec/${this.state.wfIdRerun}`}
          >
            {this.state.wfIdRerun}
          </a>
          {this.state.activeTab === 'editRerun' ? (
            <Button
              variant={
                this.state.status === 'OK'
                  ? 'success'
                  : this.state.status === 'Executing...'
                  ? 'info'
                  : this.state.status === 'Execute'
                  ? 'primary'
                  : 'danger'
              }
              onClick={this.executeWorkflow.bind(this)}
            >
              {this.state.status}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withRouter(DetailsModal);

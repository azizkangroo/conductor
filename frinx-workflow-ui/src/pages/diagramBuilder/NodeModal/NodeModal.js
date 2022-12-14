// @flow
import GeneralTab from './GeneralTab';
import InputsTab from './InputsTab';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { GlobalContext } from '../../../common/GlobalContext';
import { hash } from '../builder-utils';
import { HttpClient as http } from '../../../common/HttpClient';
import { jsonParse } from '../../../common/utils';

const OBJECT_KEYWORDS = ['template', 'body'];

const renameObjKey = (oldObj, oldKey, newKey) => {
  return Object.keys(oldObj).reduce((acc, val) => {
    if (val === oldKey) acc[newKey] = oldObj[oldKey];
    else acc[val] = oldObj[val];
    return acc;
  }, {});
};

function NodeModal(props) {
  const global = useContext(GlobalContext);
  const [inputs, setInputs] = useState([]);
  const [name, setName] = useState();
  const [version, setVersion] = useState();
  const [description, setDescription] = useState();
  const [inputParameters, setInputParameters] = useState([]);

  useEffect(() => {
    const inputs = props.inputs.inputs;
    const { name, description } = inputs;

    setName(name);
    setDescription(jsonParse(description));
    setInputs(inputs);

    const { subWorkflowParam } = props.inputs.inputs;

    if (subWorkflowParam) {
      const { name, version } = subWorkflowParam;
      setName(name);
      setVersion(version);

      http.get(global.backendApiUrlPrefix + '/metadata/workflow/' + name + '?version=' + version).then(res => {
        setInputParameters(res.inputParameters);
      });
    }
  }, [props.inputs]);

  function handleSave() {
    props.saveInputs(inputs, props.inputs.id);
    props.modalHandler();
  }

  function addNewInputParam(param) {
    const inputParameters = { ...inputs.inputParameters };

    const updatedInputs = {
      ...inputs,
      inputParameters: {
        ...inputParameters,
        [param]: '${workflow.input.' + param + '}',
      },
    };

    setInputs(updatedInputs);
  }

  function removeInputParam(param) {
    const inputParameters = { ...inputs.inputParameters };

    const updatedInputs = {
      ...inputs,
      inputParameters: {
        ...inputParameters,
      },
    };

    if (updatedInputs.inputParameters.hasOwnProperty(param)) {
      delete updatedInputs.inputParameters[param];
    }

    setInputs(updatedInputs);
  }

  function addRemoveHeader(handleOperation, i) {
    const updatedInputs = { ...inputs };
    const headers = updatedInputs['inputParameters']['http_request']['headers'];

    if (handleOperation) {
      const key = 'key_' + hash();
      headers[key] = 'value_' + hash();
    } else {
      delete headers[Object.keys(headers)[i]];
    }
    updatedInputs['inputParameters']['http_request']['headers'] = headers;
    setInputs(updatedInputs);
  }

  function updateInputParams(value, key, entry) {
    let updatedInputs = { ...inputs };
    const inputParameters = updatedInputs.inputParameters;

    if (typeof key[1] === 'object') {
      if (OBJECT_KEYWORDS.find(e => entry[0].includes(e))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.log(e);
        }
      }
    }

    updatedInputs = {
      ...updatedInputs,
      inputParameters: {
        ...inputParameters,
        [entry[0]]: value,
      },
    };

    setInputs(updatedInputs);
  }

  function updateHTTPHeader(value, i, headerKey) {
    const copiedInputs = { ...inputs };
    const headers = copiedInputs['inputParameters']['http_request']['headers'];
    const header = Object.keys(headers)[i];

    if (headerKey) {
      copiedInputs['inputParameters']['http_request']['headers'] = renameObjKey(headers, header, value);
    } else {
      copiedInputs['inputParameters']['http_request']['headers'][header] = value;
    }

    return copiedInputs['inputParameters']['http_request']['headers'];
  }

  function updateGraphQLRequest(value, key, entry) {
    let copiedInputs = { ...inputs };
    const inputParameters = copiedInputs.inputParameters;
    const http_request = copiedInputs.inputParameters.http_request;

    if (entry[0] === 'body') {
      copiedInputs = {
        ...copiedInputs,
        inputParameters: {
          ...inputParameters,
          http_request: {
            ...http_request,
            body: {
              variables: {},
              query: value,
            },
          },
        },
      };
    } else {
      copiedInputs = {
        ...copiedInputs,
        inputParameters: {
          ...inputParameters,
          http_request: {
            ...http_request,
            [entry[0]]: value,
          },
        },
      };
    }

    setInputs(copiedInputs);
  }

  function updateHTTPRequest(value, key, entry, i, headerKey) {
    let copiedInputs = { ...inputs };
    let http_request = copiedInputs.inputParameters.http_request;
    const inputParameters = copiedInputs.inputParameters;

    if (typeof key[1] === 'object') {
      if (entry[0] === 'headers') {
        value = updateHTTPHeader(value, i, headerKey);
      } else if (
        OBJECT_KEYWORDS.find(e => entry[0].includes(e)) &&
        !props.inputs.inputs.taskReferenceName.includes('graphQLTaskRef_')
      ) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (entry[0] === 'method') {
      if (value === 'PUT' || value === 'POST') http_request = { ...http_request, body: http_request.body };
      else delete http_request['body'];
    }

    copiedInputs = {
      ...copiedInputs,
      inputParameters: {
        ...inputParameters,
        http_request: {
          ...http_request,
          [entry[0]]: value,
        },
      },
    };

    setInputs(copiedInputs);
  }

  function updateDecisionCase(value) {
    const copiedInputs = { ...inputs };
    let decisionCases = { ...copiedInputs.decisionCases };
    const keyNames = Object.keys(decisionCases);
    const falseCase = decisionCases[keyNames[0]] || [];

    decisionCases = {
      [value]: falseCase,
    };

    copiedInputs.decisionCases = decisionCases;
    setInputs(copiedInputs);
  }

  function updateDescription(value) {
    const copiedInputs = { ...inputs };
    let descriptionObj;

    try {
      descriptionObj = JSON.parse(copiedInputs.description);
    } catch (e) {
      descriptionObj = {
        description: '',
        labels: [],
      };
    }

    descriptionObj = {
      ...descriptionObj,
      description: value,
    };

    copiedInputs.description = JSON.stringify(descriptionObj);
    setInputs(copiedInputs);
  }

  function handleInput(value, key, entry, i, headerKey) {
    switch (key[0]) {
      case 'inputParameters':
        updateInputParams(value, key, entry);
        break;
      case 'headers':
      case 'http_request':
        updateHTTPRequest(value, key, entry, i, headerKey);
        break;
      case 'graphql_request':
        updateGraphQLRequest(value, key, entry);
        break;
      case 'decisionCases':
        updateDecisionCase(value);
        break;
      case 'description':
        updateDescription(value);
        break;
      default: {
        let copiedInputs = { ...inputs };
        copiedInputs = {
          ...copiedInputs,
          [key]: value,
        };
        setInputs(copiedInputs);
        break;
      }
    }
  }

  return (
    <Modal size="lg" show={props.show} onHide={props.modalHandler}>
      <Modal.Header>
        <Modal.Title>
          {name} / {version}
          <div style={{ fontSize: '18px' }}>
            <p className="text-muted">{description?.description}</p>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '30px' }}>
        <Tabs style={{ marginBottom: '20px' }}>
          {name !== 'RAW' && ( // Only display general settings for non RAW tasks
            <Tab eventKey={1} title="General">
              <GeneralTab inputs={inputs} handleInput={handleInput} />
            </Tab>
          )}
          <Tab eventKey={2} title="Input parameters">
            <InputsTab
              inputs={inputs}
              name={name}
              handleInput={handleInput}
              addNewInputParam={addNewInputParam}
              removeInputParam={removeInputParam}
              inputParameters={inputParameters}
              addRemoveHeader={addRemoveHeader}
              taskReferenceName={props.inputs.inputs.taskReferenceName}
            />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleSave()}>
          Save
        </Button>
        <Button variant="secondary" onClick={props.modalHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default NodeModal;

import { useEffect, useRef, useState } from "react";
import { ClientForm } from "../../interfaces/models/client";
import { Button, Form, Input, Modal } from "antd";
import { defaultHttp } from "../../utils/http";
import { apiURL } from "../../routes/api";
import { errorCallback } from "../../utils/userHTTPCallback";
import AlertBadge from "../alert";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';

export interface FormProps {
  onSuccess: () => void,
  onError: () => void,
  onSubmit: () => void,
  onClose: () => void,
  show: boolean,
  formData: ClientForm,
}

const FormClient = (props: FormProps) => {
  const [alertEditTheme, setAlertEditTheme] = useState<string>("");
  const [alertEditMessage, setAlertEditMessage] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const mounted = useRef(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      form.setFieldsValue(props.formData)
    }
  })

  const setAlertEdit = (theme: string, message?: string) => {
    setAlertEditTheme(theme)
    if (message) { setAlertEditMessage(message) }
  }

  const onSubmitForm = (record: ClientForm) => {
    setLoading(true);
    props.onSubmit();
    const isUpdate = !!record.id
    const onSuccess = () => {
      setLoading(false)
      setAlertEdit("success", `Client ${isUpdate ? ['ID',record.id].join(' ') : ''} is ${isUpdate ? 'updated' : 'created'} successfully.`)
      props.onSuccess()
    }
    const onError = ({response}:any) => {
      if (!response) { return }
      const {data} = response;
      if (data) {
        errorCallback(data, setAlertEditMessage)
      }
      setLoading(false);
      setAlertEdit("error");
    }
    if (isUpdate) {
      defaultHttp
        .put(`${apiURL.clients}/${record.id}`, record)
        .then(onSuccess)
        .catch(onError);
    } else {
      defaultHttp
        .post(apiURL.clients, record)
        .then(onSuccess)
        .catch(onError);
    }
  }

  const getTitle = () => {
    if (props.formData?.id) {
      return `Edit Client ${props.formData?.id}`
    }
    return 'Create Client'
  }

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <Modal
      open={props.show}
      onCancel={() => props.onClose()}
      footer=""
      title={
        <div
          style={{
            width: '100%',
            cursor: 'move',
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          // fix eslintjsx-a11y/mouse-events-have-key-events
          // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
          onFocus={() => {}}
          onBlur={() => {}}
          // end
        >
          {getTitle()}
        </div>
      }
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event: any, uiData: any) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <Form
        className="space-y-4 md:space-y-6"
        form={form}
        name="login"
        onFinish={onSubmitForm}
        layout={'vertical'}
        requiredMark={false}
      >
        <div>
          {
            alertEditTheme == "" ? "" : 
            <AlertBadge message={alertEditMessage} theme={alertEditTheme} />
          }
          <Form.Item
              name="id"
              style={{display:"none"}}
            >
            <Input
              type='hidden'
            />
          </Form.Item>
          <Form.Item
            name="company"
            label={
              <p className="block text-sm font-medium text-gray-900">Company Name</p>
            }
            rules={[
              {
                required: true,
                message: 'company name should be filled',
              },
            ]}
          >
            <Input
              placeholder="please enter client name"
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="website"
            label={
              <p className="block text-sm font-medium text-gray-900">Website</p>
            }
          > 
            <Input
              placeholder="please enter website address"
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>
        <div className="text-center">
          <Button
            className="mt-4 bg-primary mb-4"
            block
            loading={loading}
            type="primary"
            size="large"
            htmlType={'submit'}
          >
            { !!form.getFieldValue("id") ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default FormClient;
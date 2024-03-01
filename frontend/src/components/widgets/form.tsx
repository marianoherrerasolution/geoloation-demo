import { useEffect, useRef, useState } from "react";
import { ProductForm } from "../../interfaces/models/product";
import { Button, Card, Col, Form, Input, Modal, Row, Select, message, Tabs } from "antd";
import { defaultHttp } from "../../utils/http";
import { apiURL } from "../../routes/api";
import { errorCallback } from "../../utils/userHTTPCallback";
import AlertBadge from "../alert";
import { SelectTag } from "../../interfaces/models/select";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { WidgetForm } from "../../interfaces/models/widget";
import titleize from "titleize";
import FormProduct from "../products/form";
import { generateRandomToken } from "../../utils";
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import type { TabsProps } from 'antd';

export interface FormProps {
  onSuccess: () => void,
  onError: () => void,
  onSubmit: () => void,
  onClose: () => void,
  onShowClient: () => void,
  show: boolean,
  formData: WidgetForm,
  clientOptions: Array<SelectTag>,
}

const FormWidget = (props: FormProps) => {
  const admin = useSelector((state: RootState) => state.admin);
  const [alertEditTheme, setAlertEditTheme] = useState<string>("");
  const [alertEditMessage, setAlertEditMessage] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const mounted = useRef(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [productOptions, setProductOptions] = useState<Array<SelectTag>>([])
  const [restrictionOptions, setRestrictionOptions] = useState<Array<SelectTag>>([])
  const [widgetToken, setWidgetToken] = useState<string>("")
  
  const draggleRef = useRef<HTMLDivElement>(null);
  const restrictionTypeOptions = [
    {label: "Product Base", value: "product_base"},
    {label: "Custom", value: "custom"},
  ]
  const statusOptions = [
    {label: "Active", value: 1},
    {label: "Inactive", value: 2},
  ]
  
  const rejectActionOptions = [
    {label: "Close Browser Automatically", value: "close"},
    {label: "Alert Only", value: "alert"},
    {label: "Alert and Close", value: "alert_close"},
    {label: "Redirect Automatically", value: "redirect"},
    {label: "Alert and Redirect", value: "alert_redirect"},
    {label: "No Action", value: "nothing"},
  ]

  const allowActionOptions = [
    {label: "No Action", value: "nothing"},
    {label: "Alert Only", value: "alert"},
    {label: "Alert and Redirect", value: "alert_close"},
    {label: "Redirect Automatically", value: "redirect"}
  ]

  const [showProduct, setShowProduct] = useState<boolean>(false);
  const [isProductBase, setIsProductBase] = useState<boolean>(true)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      let record = props.formData;
      if (!record.id) {
        record.restriction_type = "product_base"
        record.active = 1
        setWidgetToken(generateRandomToken(72))
      } else {
        setWidgetToken(record.token)
      }
      
      form.setFieldsValue(record)
      getProducts()
      getRestrictions()
      setIsProductBase(record.restriction_type == "product_base")
    }
  })

  const setAlertEdit = (theme: string, message?: string) => {
    setAlertEditTheme(theme)
    if (message) { setAlertEditMessage(message) }
  }

  const widgetURL = () => admin ? apiURL.widgets : apiURL.user.widgets
  const restrictionURL = () => admin ? apiURL.restrictions : apiURL.user.restrictions
  const productURL = () => admin ? apiURL.products : apiURL.user.products

  const onSubmitForm = (record: WidgetForm) => {
    setLoading(true);
    props.onSubmit();
    const isUpdate = !!record.id
    const onSuccess = (response: any) => {
      let result = response.data as WidgetForm
      form.setFieldsValue(result)
      setLoading(false)
      setAlertEdit("success", `Widget ${isUpdate ? ['ID',record.id].join(' ') : ''} is ${isUpdate ? 'updated' : 'created'} successfully.`)
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
      record.token = ""
      defaultHttp
        .put(`${widgetURL()}/${record.id}`, record)
        .then(onSuccess)
        .catch(onError);
    } else {
      record.token = widgetToken
      defaultHttp
        .post(widgetURL(), record)
        .then(onSuccess)
        .catch(onError);
    }
  }

  const onSelectedClient = (val:string) => {
    if (val == "") {
      props.onShowClient()
    } else {
      getProducts()
      getRestrictions()
    }
  }

  const getRestrictions = () => {
    if (admin && !form.getFieldValue("client_id")) {return}
    setAlertEdit("","")
    defaultHttp.get(`${restrictionURL()}/select`,{params: {client_id: form.getFieldValue("client_id")}})
    .then(({data}) => {
      let selectOptions = []
      if (data && data.length > 0) {
        let totalData = data.length
        for (let i = 0; i < totalData; i += 1) {
          selectOptions.push({value: data[i].id, label: titleize(data[i].name)})
        }
      }
      setRestrictionOptions(selectOptions)
    })
    .catch(({response}) => {
      setAlertEdit("error", "Restriction list from client can not be loaded.")
    });
  }

  const getProducts = () => {
    if (admin && !form.getFieldValue("client_id")) {return}
    setAlertEdit("","")
    defaultHttp.get(`${productURL()}/select`,{params: {client_id: form.getFieldValue("client_id")}})
    .then(({data}) => {
      let selectOptions = []
      if (data && data.length > 0) {
        let totalData = data.length
        for (let i = 0; i < totalData; i += 1) {
          selectOptions.push({value: data[i].id, label: titleize(data[i].name)})
        }
      }
      setProductOptions(selectOptions)
    })
    .catch(({response}) => {
      setAlertEdit("error", "Product list from client can not be loaded.")
    });
  }

  const onSelectedProduct = (val:string) => {
    if (val == "") {
      setShowProduct(true)
    }
  }

  const getTitle = () => {
    if (form.getFieldValue("id")) {
      return `Edit Widget ${form.getFieldValue("id")}`
    }
    return 'Create Widget'
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

  const onProductError = () => {}

  const onProductSuccess = () => {
    getProducts()
  }

  const onProductSubmit = () => {}

  const onSelectedRestrictionType = (val: string) => {
    setIsProductBase(val == "product_base")
  }

  const javascriptWidget = () => {
    return `
      <script type="text/javascript" src="${import.meta.env.VITE_WIDGET_JS}?token=${widgetToken}" async></script> 
    `
  }

  const tabTokensItems = () => {
    return [
      {
        key: '1',
        label: 'API Token',
        children: <Card title="Token" style={{ width: "100%" }}
          extra={
            <a href="javascript:void(0)"
              onClick={() => {
                navigator.clipboard.writeText(widgetToken)
                message.success("copied token")
              }}
            >copy</a>
          }
        >
          { widgetToken }  
        </Card>,
      },
      {
        key: '2',
        label: 'Web Script',
        children: <Card title="Javascript Widget" style={{ width: "100%" }}
          extra={
            <a href="javascript:void(0)"
              onClick={() => {
                navigator.clipboard.writeText(javascriptWidget())
                message.success("copied javascript")
              }}
            >copy</a>
          }
        >
          <p style={{fontSize: "14px"}}>Copy javascript widget then paste it before <b>{"</head>"}</b> or <b>{"</body>"}</b></p>
          <p>&nbsp;</p>
          <div style={{background:"rgb(251, 251, 251)", padding:"10px"}}>{javascriptWidget()}</div>
          
        </Card>,
      },
    ] as TabsProps['items'] 
  }

  return (
    <Modal
      open={props.show}
      onCancel={() => props.onClose()}
      width={1200}
      style={{top: 0}}
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
        className="space-y-0 md:space-y-6"
        form={form}
        name="login"
        onFinish={onSubmitForm}
        layout={'vertical'}
        requiredMark={false}
      >
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
          name="name"
          label={
            <p className="block text-sm font-medium text-gray-900">Widget Name</p>
          }
          rules={[
            {
              required: true,
              message: 'widget name should be filled',
            },
          ]}
        >
          <Input
            placeholder="please enter widget name"
            className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
          />
        </Form.Item>
        <Row gutter={24}>
          <Col span={admin ? 12 : 24}>
            <Form.Item
              name="active"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Status</p>
              }
              rules={[
                {
                  required: true,
                  message: 'status should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select status"
                options={statusOptions}
              />
            </Form.Item>
          </Col>
          { admin ? <Col span={12}>
            <Form.Item
              name="client_id"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Client</p>
              }
              rules={[
                {
                  required: true,
                  message: 'client should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select a client"
                onSelect={(e) => onSelectedClient(e)}
                options={props.clientOptions}
              />
            </Form.Item>
          </Col> : "" }
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="restriction_type"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Restriction Type</p>
              }
              rules={[
                {
                  required: true,
                  message: 'restriction type should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select restriction type"
                onSelect={(e) => onSelectedRestrictionType(e)}
                options={restrictionTypeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={isProductBase ? "product_ids" : "restriction_ids"}
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">{isProductBase ? "Products" : "Restrictions"}</p>
              }
              rules={[
                {
                  required: true,
                  message: 'should be selected',
                },
              ]}
            > 
              <Select      
                mode='multiple'
                showSearch
                allowClear
                maxTagCount={1}
                placeholder={`Select ${isProductBase ? 'product' : 'restriction'}(s)`}
                options={isProductBase ? productOptions : restrictionOptions}
              />
            </Form.Item>
            
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Tabs defaultActiveKey="1" items={tabTokensItems()} />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="reject_action"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Action on rejected</p>
              }
              rules={[
                {
                  required: true,
                  message: 'action should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select allow action"
                options={rejectActionOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="reject_alert"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Rejection Alert</p>
              }
            > 
              <Input
                placeholder="write your message"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="reject_redirect"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Redirect or in-app URL</p>
              }
            > 
              <Input
                placeholder="write address url or in-app"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="allow_action"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Action on allowed</p>
              }
              rules={[
                {
                  required: true,
                  message: 'action should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select allow action"
                options={rejectActionOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="allow_alert"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Allowed Message</p>
              }
            > 
              <Input
                placeholder="write your message"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="allow_redirect"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Redirect or in-app URL</p>
              }
            > 
              <Input
                placeholder="write address url or in-app"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Col>
        </Row>
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
      {
        showProduct ? <FormProduct
          show={showProduct} 
          onClose={() => setShowProduct(false)} 
          onError={onProductError}
          onSubmit={onProductSubmit}
          onSuccess={onProductSuccess}
          onShowClient={props.onShowClient}
          clientOptions={props.clientOptions}
          formData={{} as ProductForm}
        /> : ""
      }
    </Modal>
  )
}

export default FormWidget;
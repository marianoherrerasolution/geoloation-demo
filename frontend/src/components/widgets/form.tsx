import { useEffect, useRef, useState } from "react";
import { ProductForm } from "../../interfaces/models/product";
import { Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { defaultHttp } from "../../utils/http";
import { apiURL } from "../../routes/api";
import { errorCallback } from "../../utils/userHTTPCallback";
import AlertBadge from "../alert";
import { SelectGeoAddress, SelectTag } from "../../interfaces/models/select";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { WidgetForm } from "../../interfaces/models/widget";
import titleize from "titleize";
import FormProduct from "../products/form";
import { Coordinate } from "ol/coordinate";

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
  const [alertEditTheme, setAlertEditTheme] = useState<string>("");
  const [alertEditMessage, setAlertEditMessage] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const mounted = useRef(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [productOptions, setProductOptions] = useState<Array<SelectTag>>([])
  const [restrictionOptions, setRestrictionOptions] = useState<Array<SelectTag>>([])
  const draggleRef = useRef<HTMLDivElement>(null);
  const restrictionTypeOptions = [
    {label: "Product Base", value: "product_base"},
    {label: "Custom", value: "custom"},
  ]
  const statusOptions = [
    {label: "Active", value: true},
    {label: "Inactive", value: false},
  ]
  const [showProduct, setShowProduct] = useState<boolean>(false);
  const [restrictionType, setRestrictionType] = useState<string>("product_base")

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      form.setFieldsValue(props.formData)
      getProducts()
    }
  })

  const setAlertEdit = (theme: string, message?: string) => {
    setAlertEditTheme(theme)
    if (message) { setAlertEditMessage(message) }
  }

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
      defaultHttp
        .put(`${apiURL.widgets}/${record.id}`, record)
        .then(onSuccess)
        .catch(onError);
    } else {
      defaultHttp
        .post(apiURL.widgets, record)
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
    if (!form.getFieldValue("client_id")) {return}
    setAlertEdit("","")
    defaultHttp.get(`${apiURL.restrictions}/select`,{params: {client_id: form.getFieldValue("client_id")}})
    .then(({data}) => {
      let selectOptions = []
      let totalData = data.length
      for (let i = 0; i < totalData; i += 1) {
        selectOptions.push({value: data[i].id, label: titleize(data[i].name)})
      }
      setRestrictionOptions(selectOptions)
    })
    .catch(({response}) => {
      setAlertEdit("error", "Restriction list from client can not be loaded.")
    });
  }

  const getProducts = () => {
    if (!form.getFieldValue("client_id")) {return}
    setAlertEdit("","")
    defaultHttp.get(`${apiURL.products}/select`,{params: {client_id: form.getFieldValue("client_id")}})
    .then(({data}) => {
      let selectOptions = [{value: "", label: "Create New Product"}]
      let totalData = data.length
      for (let i = 0; i < totalData; i += 1) {
        selectOptions.push({value: data[i].id, label: titleize(data[i].name)})
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
    setRestrictionType(val)
  }

  return (
    <Modal
      open={props.show}
      onCancel={() => props.onClose()}
      width={1200}
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
          <Col span={12}>
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
          </Col>
          <Col span={12}>
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
          <Col key={form.getFieldValue("restriction_type")} span={12}>
            {
              restrictionType == "product_base" ? <Form.Item
                name="product_ids"
                className="mb-0"
                label={
                  <p className="block text-sm font-medium text-gray-900">Products</p>
                }
                rules={[
                  {
                    required: true,
                    message: 'product should be selected',
                  },
                ]}
              > 
                <Select      
                  mode='multiple'
                  showSearch
                  allowClear
                  maxTagCount={1}
                  placeholder="Select product(s)"
                  options={productOptions}
                />
              </Form.Item> : <Form.Item
                name="restriction_ids"
                className="mb-0"
                label={
                  <p className="block text-sm font-medium text-gray-900">Restrictions</p>
                }
                rules={[
                  {
                    required: true,
                    message: 'restriction should be selected',
                  },
                ]}
              > 
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  placeholder="Select restriction(s)"
                  options={restrictionOptions}
                />
              </Form.Item>
            }
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
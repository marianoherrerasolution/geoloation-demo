import { useEffect, useRef, useState } from "react";
import { ProductForm } from "../../interfaces/models/product";
import { AutoComplete, Button, Col, Flex, Form, Input, Modal, Row, Select } from "antd";
import { defaultHttp } from "../../utils/http";
import { apiURL } from "../../routes/api";
import { errorCallback } from "../../utils/userHTTPCallback";
import AlertBadge from "../alert";
import { SelectGeoAddress, SelectTag } from "../../interfaces/models/select";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import GeoMap from "../geomap";
import TextArea from "antd/es/input/TextArea";
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { RestrictionForm } from "../../interfaces/models/restriction";
import titleize from "titleize";
import FormProduct from "../products/form";

export interface FormProps {
  onSuccess: () => void,
  onError: () => void,
  onSubmit: () => void,
  onClose: () => void,
  onShowClient: () => void,
  show: boolean,
  formData: RestrictionForm,
  clientOptions: Array<SelectTag>,
}

const FormRestriction = (props: FormProps) => {
  const [alertEditTheme, setAlertEditTheme] = useState<string>("");
  const [alertEditMessage, setAlertEditMessage] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const mounted = useRef(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [productOptions, setProductOptions] = useState<Array<SelectTag>>([])
  const draggleRef = useRef<HTMLDivElement>(null);
  const allowanceOptions = [
    {label: "Allow", value: true},
    {label: "Deny", value: false},
  ]
  const statusOptions = [
    {label: "Active", value: true},
    {label: "Inactive", value: false},
  ]
  const [addressOptions, setAddressOptions] = useState<Array<SelectTag>>([]);
  const openStreetProvider = new OpenStreetMapProvider();
  const [centerLat, setCenterLat] = useState<number>(0)
  const [centerLon, setCenterLon] = useState<number>(0)
  const [showProduct, setShowProduct] = useState<boolean>(false);

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

  const onSubmitForm = (record: ProductForm) => {
    setLoading(true);
    props.onSubmit();
    const isUpdate = !!record.id
    const onSuccess = (response: any) => {
      let product = response.data as ProductForm
      form.setFieldsValue(product)
      setLoading(false)
      setAlertEdit("success", `Product ${isUpdate ? ['ID',record.id].join(' ') : ''} is ${isUpdate ? 'updated' : 'created'} successfully.`)
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
        .put(`${apiURL.restrictions}/${record.id}`, record)
        .then(onSuccess)
        .catch(onError);
    } else {
      defaultHttp
        .post(apiURL.restrictions, record)
        .then(onSuccess)
        .catch(onError);
    }
  }

  const onSelectedClient = (val:string) => {
    if (val == "") {
      props.onShowClient()
    } else {
      getProducts()
    }
  }

  const getProducts = () => {
    if (!form.getFieldValue("client_id")) {return nil}
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
      return `Edit Restriction ${form.getFieldValue("id")}`
    }
    return 'Create Restriction'
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

  const handleSearchAddress = (keyword:string) => {
    if (keyword == "" || keyword.length < 3) {
      return
    }
    openStreetProvider.search({ query: keyword }).then((results:Array<SelectGeoAddress>) => {
      let selectTags = []
      for (let i = 0; i < results.length; i += 1) {
        selectTags.push({label: results[i].label, value: results[i].label, x: results[i].x, y: results[i].y})
      }
      setAddressOptions(selectTags)
    })
  }

  const selectSearchAddress = (item:any, opts:any) => {
    form.setFieldValue("address_lat", opts.y)
    form.setFieldValue("address_lon", opts.x)
    setCenterLat(opts.y)
    setCenterLon(opts.x)
  }

  const onProductError = () => {}

  const onProductSuccess = () => {
    getProducts()
  }

  const onProductSubmit = () => {}


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
            <p className="block text-sm font-medium text-gray-900">Restriction Name</p>
          }
          rules={[
            {
              required: true,
              message: 'restriction name should be filled',
            },
          ]}
        >
          <Input
            placeholder="please enter restriction name"
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
              name="product_id"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Product</p>
              }
              rules={[
                {
                  required: true,
                  message: 'product should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select a product"
                onSelect={(e) => onSelectedProduct(e)}
                options={productOptions}
              />
            </Form.Item>

          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="networks"
              label={
                <p className="block text-sm font-medium text-gray-900">Networks</p>
              }
            >
              <Input
                placeholder="please enter domain, ip or ip range"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="active"
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
          <Col span={8}>
            <Form.Item
              name="allow"
              label={
                <p className="block text-sm font-medium text-gray-900">Access Type</p>
              }
              rules={[
                {
                  required: true,
                  message: 'access type should be selected',
                },
              ]}
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select allow"
                options={allowanceOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="address"
              label={
                <p className="block text-sm font-medium text-gray-900">Search Address For Drawing Polygons</p>
              }
            >
              <AutoComplete
                onSearch={handleSearchAddress}
                placeholder="search address for map center"
                options={addressOptions}
                onSelect={selectSearchAddress}
              />
            </Form.Item>
            <Form.Item
                name="address_lat"
                style={{display:"none"}}
              >
              <Input
                type='hidden'
              />
            </Form.Item>
            <Form.Item
                name="address_lon"
                style={{display:"none"}}
              >
              <Input
                type='hidden'
              />
            </Form.Item>
            <GeoMap lat={centerLat} lon={centerLon} />
          </Col>
          <Col span={24}>
            <Form.Item
              name="address"
              label={
                <p className="block text-sm font-medium text-gray-900">Polygons</p>
              }
            > 
              <TextArea
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

export default FormRestriction;
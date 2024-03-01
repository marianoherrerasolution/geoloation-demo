import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { BreadcrumbProps, Modal, Select, Space, Button, Input, Tag, Tabs, Card, Row, Col } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { Widget, WidgetForm } from '../../interfaces/models/widget';
import { apiURL } from '../../routes/api';
import { adminRoutes } from '../../routes/web';
import {
  handleErrorResponse,
} from '../../utils';
import BasePageContainer from '../layout/PageContainer';
import Icon, {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import AlertBadge from '../alert';
import { errorCallback } from '../../utils/userHTTPCallback';
import { defaultHttp } from '../../utils/http';
import { ClientForm } from '../../interfaces/models/client';
import titleize  from 'titleize';
import { SelectTag } from '../../interfaces/models/select';
import { BiSolidPackage } from 'react-icons/bi';
import FormWidget from './form';
import FormClient from '../clients/form';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import type { TabsProps } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Typography } from 'antd';

enum ActionKey {
  DELETE = 'delete',
  EDIT = 'edit'
}

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: adminRoutes.widgets,
      title: <Link to={adminRoutes.widgets}>Widgets</Link>,
    },
  ],
};

const Widgets = () => {
  const { Title } = Typography;
  const admin = useSelector((state: RootState) => state.admin);
  const actionRef = useRef<ActionType>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [alertTableTheme, setAlertTableTheme] = useState<string>("");
  const [alertTableMessage, setAlertTableMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [clientIDs, setClienttIDs] = useState<Array<number>>([]);
  const [formData, setFormData] = useState<WidgetForm>({} as WidgetForm);
  const [formDataClient, setFormDataClient] = useState<ClientForm>({} as ClientForm);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showClient, setShowClient] = useState<boolean>(false);
 
  const mounted = useRef(false);
  const [selectClients, setSelectClients] = useState<Array<SelectTag>>([])
  const WidgetJS = import.meta.env.VITE_WIDGET_JS;
  const WidgetAPI = import.meta.env.VITE_WIDGET_API;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (admin) { getClients(); }
    }
  })

  const widgetURL = () => admin ? apiURL.widgets : apiURL.user.widgets
  const getClients = () => {
    defaultHttp.get(`${apiURL.clients}/select`)
    .then(({data}) => {
      let clientForOptions = [{value: "", label: "Create New Client"}]
      let totalData = data.length
      for (let i = 0; i < totalData; i += 1) {
        clientForOptions.push({value: data[i].id, label: titleize(data[i].company)})
      }
      setSelectClients(clientForOptions)
    })
    .catch(({response}) => {
      setAlertTable("error", "Client list can not be loaded.")
    });
  }

  const filterByClient = (clientID: number) => {
    setClienttIDs([clientID])
    actionRef.current?.reload(true);
  }
  
  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      sorter: false,
      render: (_, row: Widget) => row.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.name ? titleize(row.name) : ""
    },
    {
      title: 'Type',
      dataIndex: 'restriction_type',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.restriction_type ? titleize(row.restriction_type.replace("_", " ")) : ""
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => <>{ 
        row.client_name ? <a onClick={() => filterByClient(row.client_id)} >{titleize(row.client_name)}</a> : <></>
      }</>
    },
    {
      title: 'Status',
      dataIndex: 'active',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.active < 2 ? <Tag color="lime">Active</Tag> : <Tag color="gray">Inactive</Tag>
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: Widget) => [
        <TableDropdown
          key="actionGroup"
          onSelect={(key) => handleActionOnSelect(key, row)}
          menus={[
            {
              key: ActionKey.DELETE,
              name: (
                <Space>
                  <DeleteOutlined />
                  Delete
                </Space>
              ),
            },
            {
              key: ActionKey.EDIT,
              name: (
                <Space>
                  <EditOutlined />
                  Edit
                </Space>
              ),
            },
          ]}
        >
          <Icon component={CiCircleMore} className="text-primary text-xl" />
        </TableDropdown>,
      ],
    },
  ];

  const handleActionOnSelect = (key: string, widget: Widget) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(widget)
      case ActionKey.EDIT:
        return showEditModal(widget)
      default:
        return
    }
  };

  const showEditModal = (record: WidgetForm) => {
    setFormData(record)
    setAlertTable("")
    setShowEdit(true)
  }

  const showNewWidget = () =>{
    let record:WidgetForm = {} as WidgetForm
    setFormData(record)
    setAlertTable("")
    setShowEdit(true)
  }

  const setAlertTable = (theme: string, message?: string) => {
    setAlertTableTheme(theme)
    if (message) { setAlertTableMessage(message) }
  }

  const onSubmitForm = () => {
    setAlertTable("")
  }

  const onSubmitSuccess = () => {
    actionRef.current?.reload(true);
  }

  const onSubmitError = () => {

  }

  const showDeleteConfirmation = (widget: Widget) => {
    modal.confirm({
      title: 'Are you sure to delete this Widget?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ widget.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Name">
            {titleize(widget.name || "")}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Client">
            {titleize(widget.client_name || "")}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Restriction Type">
            {titleize((widget.restriction_type || "").replace("_", ""))}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${widgetURL()}/${widget.id}`)
          .then(() => {
            setAlertTable("success", `Widget ID ${widget.id} is deleted successfully.`)
            actionRef.current?.reload(true);
          })
          .catch(({response}) => {
            if (!response) { return }
            const {data} = response;
            if (data) {
              errorCallback(data, setAlertTableMessage)
            }
            setAlertTableTheme("error")
          });
      },
    });
  };

  const searchByKeyword = (e:any) => {
    setKeyword(e.target.value)
    actionRef.current?.reload(true);
  }

  const changedClientForm = (e: any) => {
    console.log(e)
  }

  const searchByClient = (ids: any) => {
    setClienttIDs(ids.filter( (a:any) => Number(a) > 0))
    actionRef.current?.reload(true);
  }

  const onSelectClient = (val: number) => {
    if (val < 1) {
      showClientForm()
    }
  }

  const showClientForm = () => {
    setShowClient(true)
    setFormDataClient({} as ClientForm)
  }

  const onClientError = () => {

  }

  const onClientSuccess = () => {
    getClients()
  }

  const onClientSubmit = () => {

  }

  const tabHTMLs= () => {
    return [
      {
        key: '1',
        label: 'Insert before </head>',
        children: <SyntaxHighlighter language="html" style={docco}>
          {javascriptWidget()}
        </SyntaxHighlighter>,
      },
      {
        key: '2',
        label: 'Insert before </body>',
        children: <SyntaxHighlighter language="html" style={docco}>
          {javascriptWidget2()}
        </SyntaxHighlighter>,
      },
    ] as TabsProps['items'] 
  }

  const tabCodes = () => {
    return [
      {
        key: '1',
        label: 'cURL',
        children: <SyntaxHighlighter language="html" style={docco}>
          {
            `
  curl \\
  -X GET '${WidgetAPI}?token=YOUR-API-TOKEN'
            `
          }
        </SyntaxHighlighter>,
      },
      {
        key: '2',
        label: 'NodeJS',
        children: <SyntaxHighlighter language="javascript" style={docco}>
          {
            `
fetch('${WidgetAPI}?token=YOUR-API-TOKEN').
then((resp) => {
  console.log(\`Success Data: \${JSON.stringify(resp.data)}\`)
  // Process the response content as needed
}).
catch((err) => {
  console.log(\`Error Status: \${err.status}\`)
  console.log(\`Error Data: \${JSON.stringify(err.data)}\`)
})
            `
          }
        </SyntaxHighlighter>,
      },
      {
        key: '3',
        label: 'Ruby',
        children: <SyntaxHighlighter language="ruby" style={docco}>
          {
            `
require 'uri'
require 'net/http'

uri = URI('${WidgetAPI}')
params = { :token => 'YOUR-API-TOKEN' }
uri.query = URI.encode_www_form(params)

res = Net::HTTP.get_response(uri)
puts res.body if res.is_a?(Net::HTTPSuccess)
# Process the response content as needed
            `
          }
        </SyntaxHighlighter>,
      },
      {
        key: '4',
        label: 'Golang',
        children: <SyntaxHighlighter language="go" style={docco}>
          {
            `
package main

import (
    "fmt"
    "net/http"
    "net/url"
)

func main() {
    req, err := http.NewRequest("GET", "${WidgetAPI}", nil)
    if err != nil {
        fmt.Println("Error creating request:", err)
        return
    }

    q := req.URL.Query()
    q.Add("token", "YOUR-API-TOKEN")
    req.URL.RawQuery = q.Encode()

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error sending request:", err)
        return
    }
    defer resp.Body.Close()

    respBody, _ := ioutil.ReadAll(resp.Body)
    fmt.Println("Response status:", resp.Status)
    fmt.Println("Response body:", string(respBody))
    // Process the response content as needed
}
            `
          }
        </SyntaxHighlighter>,
      },
      {
        key: '5',
        label: 'C#',
        children: <SyntaxHighlighter language="c#" style={docco}>
          {
            `
using (HttpClient client = new HttpClient())
{
    List<KeyValuePair<string, string>> queryParameters = new List<KeyValuePair<string, string>>
    {
        new KeyValuePair<string, string>("token", "YOUR-API-TOKEN")
    };

    string queryString = string.Join("&", queryParameters.Select(p => $"{p.Key}={p.Value}"));
    string url = \$"${WidgetAPI}?{queryString}";

    HttpResponseMessage response = await client.GetAsync(url);
    if (response.IsSuccessStatusCode)
    {
        string content = await response.Content.ReadAsStringAsync();
        // Process the response content as needed
    }
}
            `
}
        </SyntaxHighlighter>,
      },
      {
        key: '6',
        label: 'Rust',
        children: <SyntaxHighlighter language="rust" style={docco}>
          {
            `
use reqwest;

#[tokio::main]
async fn main() {
  let url = format!(
    "${WidgetAPI}?token={query}",
    query = "YOUR-API-TOKEN"
  );

  let client = reqwest::Client::new();
  let response = client
      .get(url)
      .header(CONTENT_TYPE, "application/json")
      .send()
      .await
      .unwrap();
  println!("Success! {:?}", response)
  // Process the response content as needed
}
            `
          }
        </SyntaxHighlighter>,
      },
      
      {
        key: '7',
        label: 'Android',
        children: <SyntaxHighlighter language="java" style={docco}>
          {`
import android.os.AsyncTask;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class MyHttpGetTask extends AsyncTask<Void, Void, String> {

    private static final String BASE_URL = "${WidgetAPI}";

    @Override
    protected String doInBackground(Void... voids) {
        try {
            // Construct the complete URL with query parameters
            String name = "YOUR-API-TOKEN";
            String urlString = BASE_URL + "?token=" + token;

            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            return response.toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    protected void onPostExecute(String result) {
        super.onPostExecute(result);
        if (result != null) {
            // Handle the response here
            // ...
        } else {
            // Handle error case
            // ...
        }
    }
}

          ` }
        </SyntaxHighlighter>,
      },
      {
        key: '8',
        label: 'Swift/IOS',
        children: <SyntaxHighlighter language="swift" style={docco}>
          {`
import Foundation

func makeGETRequest(withToken token: String) {
    let baseURLString = "${WidgetAPI}"
    var components = URLComponents(string: baseURLString)!
    components.queryItems = [URLQueryItem(name: "token", value: token)]

    guard let url = components.url else {
        print("Invalid URL")
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            // Handle the response error
            print("Error: (error.localizedDescription)")
            return
        }
        
        if let data = data {
            // Handle the response data (e.g., parse JSON)
            print("Received data: (data)")
        }
    }
    task.resume()
}

makeGETRequest(withToken: "YOUR-API-TOKEN")

          ` }         
        </SyntaxHighlighter>,
      },
      {
        key: '9',
        label: 'C',
        children: <SyntaxHighlighter language="C" style={docco}>
        {`
#include <stdio.h>
#include <curl/curl.h>

// Callback function to handle the response data
size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    // You can process the response data here (e.g., print it)
    printf("%.*s", (int)(size * nmemb), (char*)contents);
    return size * nmemb;
}

int main() {
    CURL* curl;
    CURLcode res;

    curl = curl_easy_init();
    if (curl) {
        const char* url = "${WidgetAPI}?token=YOUR-API-TOKEN";

        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);

        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        curl_easy_cleanup(curl);
    }

    return 0;
}          

        ` }         
        </SyntaxHighlighter>,
      },
      {
        key: '10',
        label: 'PHP',
        children: <SyntaxHighlighter language="php" style={docco}>
        {`
<?php
$url = '${WidgetAPI}?token=YOUR-API-TOKEN';

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPGET, true);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
} else {
    echo $response;
}

curl_close($ch);
?>

        `}         
        </SyntaxHighlighter>,
      },
    ] as TabsProps['items'] 
  }

  const tabItems = () => {
    return [
      {
        key: '1',
        label: 'Widget List',
        children: TableTabItem(),
      },
      {
        key: '2',
        label: 'Documentation',
        children: DocTabItem(),
      },
    ] as TabsProps['items'] 
  }

  const javascriptWidget = () => {
    return `
<html>
  <head>
      ... 
    <script type="text/javascript" src="${WidgetJS}?token=YOUR-WIDGET-TOKEN" async></script> 
  </head>
  <body>
  </body>
</html>
    `
  }

  const javascriptWidget2 = () => {
    return `
<html>
  <head>
  </head>
  <body>
    ...
    <script type="text/javascript" src="${WidgetJS}?token=YOUR-WIDGET-TOKEN" async></script> 
  </body>
</html>
    `
  }

  const DocTabItem = () => <>
    <Card title="WEBSITE INTEGRATION">
      <Row gutter={24}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={tabHTMLs()} />
        </Col>
      </Row>
    </Card>

    <Card title="BACKEND / API" className="mt-10">
      <Tabs defaultActiveKey="1" items={apiDocItems()} />
      <Tabs defaultActiveKey="1" items={tabCodes()} />
    </Card>
  </>

  const TableTabItem= () => <ProTable
    columns={columns}
    cardBordered={false}
    headerTitle={
      <>
        <h5>Widgets</h5>
        <Input placeholder='Search widget name' className='mr-4 ml-4' onChange={searchByKeyword} style={{width: 200}} />
        {
          admin ? <Select
          mode='multiple'
          showSearch
          allowClear
          maxTagCount={1}
          style={{ width: 200 }}
          placeholder="Select a client"
          value={clientIDs}
          options={selectClients}
          onChange={(e) => searchByClient(e)}
          onSelect={(e) => onSelectClient(e)}
        /> : ""
        }
      </>
    }
    bordered={true}
    showSorterTooltip={false}
    scroll={{ x: true }}
    tableLayout={'fixed'}
    rowSelection={false}
    pagination={{
      showQuickJumper: true,
      pageSize: 10,
    }}
    actionRef={actionRef}
    request={(params) => {
      return defaultHttp
        .get((widgetURL()), {
          params: {
            keyword,
            client_ids: clientIDs.join(","),
            page: params.current,
            per_page: params.pageSize,
          },
        })
        .then((response) => {
          const widgets: [Widget] = response.data.data;
          return {
            data: widgets,
            success: true,
            total: response.data.total,
          } as RequestData<Widget>;
        })
        .catch((error) => {
          handleErrorResponse(error);

          return {
            data: [],
            success: false,
          } as RequestData<Widget>;
        });
    }}
    dateFormatter="string"
    search={false}
    rowKey="id"
    options={{
      search: false,
    }}
    toolbar={{
      actions: [
        <Button onClick={() => showNewWidget()} key="show" type="primary" icon={<BiSolidPackage />} style={{background: "#4150e8"}}>
          New Widget
        </Button>
      ]
    }}
  />

  const APIDocTabItem = () => <Row gutter={24} >
    <Col span={24} className="mb-2" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>REQUEST</b>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      Method:
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      GET
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      URL:
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      {WidgetAPI}
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      Header:
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      Content-Type: application/json
    </Col>
    <Col span={24} className="mb-4 mt-6" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>PARAMETERS</b>
      <p>By default, API will authorize geolocation by requester ip address, if you want setup different ip address than server, please use parameter <b>ip</b> or provide latitude and longitude from user real-time location.</p>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      token: <Tag color="red">required</Tag>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      YOUR-API-TOKEN
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      ip:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      remote ip address to authorize user by geo ip location.
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      latitude:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">decimal</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      latitude number to authorize user using real latitude
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      longitude:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">decimal</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      longitude number to authorize user using real longitude
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      offset:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">integer</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      time zone offset in minutes to check access is using vpn or not
    </Col>
    <Col span={24} className="mb-4 mt-6" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>Example Codes</b>
    </Col>
  </Row>

  const SuccessRespItem = () => <Row gutter={24} >
    <Col span={24} className="mb-2" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>Response</b>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      Status Code:
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      200
    </Col>
    <Col span={24} className="mb-4 mt-6" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>JSON Attributes</b>      
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      access:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      To determine the access is allowed or rejected. The value is:
      <ul>
        <li className="mt-2 mb-2"><Tag color="green">allow</Tag> for allowed access.</li>
        <li className="mt-2 mb-2"><Tag color="volcano">reject</Tag> for rejected access.</li>
      </ul>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      action:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      To define an event or action based on an access. The value is:
      <ul>
        <li className="mt-2 mb-2"><Tag color="default">nothing</Tag> means no action is needed.</li>
        <li className="mt-2 mb-2"><Tag color="default">alert</Tag> means to show message from <Tag color="default">message</Tag> attribute.</li>
        <li className="mt-2 mb-2"><Tag color="default">redirect</Tag> means to open url or in-app address from <Tag color="default">redirect</Tag> attribute.</li>
        <li className="mt-2 mb-2"><Tag color="default">close</Tag> means to close the app without confirmation.</li>
        <li className="mt-2 mb-2"><Tag color="default">alert_close</Tag> means to show message to user then close the app.</li>
        <li className="mt-2 mb-2"><Tag color="default">alert_redirect</Tag> means to show message to user then open the url or in-app address.</li>
      </ul>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      message:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      the notification message for showed to user
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      redirect:
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      <Tag color="default">string</Tag>
    </Col>
    <Col span={20} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      web url address or in-app address for opened based on access
    </Col>
    <Col span={24} className="mb-4 mt-6" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>Example Codes</b>
    </Col>
  </Row>

  const ErrorRespItem = () => <Row gutter={24}  className="mb-4">
    <Col span={24} className="mb-2" style={{background: "#fcfcfc", padding:"8px 0px"}}>
      <b>Status Code</b>
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      401
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      Token is missing or invalid
    </Col>
    <Col span={2} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      400
    </Col>
    <Col span={22} style={{borderBottom: "1px solid rgb(248, 248, 255)", padding:"6px 0px"}}>
      IP Address do not have geolocation, please provide manual longitude and latitude parameters 
    </Col>
  </Row>

  const apiDocItems = () => {
    return [
      {
        key: '1',
        label: 'API Doc',
        children: APIDocTabItem(),
      },
      {
        key: '2',
        label: 'Success Response',
        children: SuccessRespItem(),
      },
      {
        key: '3',
        label: 'Error Response',
        children: ErrorRespItem(),
      },
    ] as TabsProps['items'] 
  }

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      {
        alertTableTheme == "" ? "" : 
        <AlertBadge message={alertTableMessage} theme={alertTableTheme} />
      }
      
      <Tabs defaultActiveKey="1" items={tabItems()} tabPosition="left" />
      {modalContextHolder}
      {
        showEdit ? <FormWidget
          show={showEdit} 
          onClose={() => setShowEdit(false)} 
          clientOptions={selectClients} 
          onError={onSubmitError}
          onSubmit={onSubmitForm}
          onSuccess={onSubmitSuccess}
          onShowClient={showClientForm}
          formData={formData}
        /> : ""
      }
      {
        showClient ? <FormClient
          show={showClient} 
          onClose={() => setShowClient(false)} 
          onError={onClientError}
          onSubmit={onSubmitForm}
          onSuccess={onClientSuccess}
          formData={formDataClient}
        /> : ""
      }
      
    </BasePageContainer>
  );
};

export default Widgets;

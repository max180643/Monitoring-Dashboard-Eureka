import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Card, Badge } from "react-bootstrap";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faGlobe,
  faPlug,
  faDesktop,
  faEthernet,
  faHdd,
  faLeaf,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Doughnut } from "react-chartjs-2";

function App() {
  const [firstTime, setFirstTime] = useState(true);
  const [connected, setConnected] = useState(0);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [inActive, setInActive] = useState(0);
  const [instances, setInstances] = useState([]);

  // lcp --proxyUrl http://127.0.0.1:8761/eureka/apps/
  const fetchData = async () => {
    await axios
      .get("http://127.0.0.1:8761/api", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => {
        setConnected(1);
        const data = res.data;
        console.log(data)
        const instancesData = data.applications.application;

        let instancesArray = instances;
        let currentArray = [];

        if (instancesArray.length === 0) {
          console.log("frist");
          instancesData.map((item) => {
            instancesArray.push({
              name: item.name,
              data: item.instance[0],
              status: item.instance[0].status,
            });
            return item;
          });
        } else {
          console.log("not frist");
          instancesData.map((item) => {
            currentArray.push({
              name: item.name,
              data: item.instance[0],
              status: item.instance[0].status,
            });
            return item;
          });
          // compare array new array to old array
          currentArray.map((currentItem) => {
            let alreadyInArray = false;
            instancesArray.map((instance, index) => {
              if (currentItem.name === instance.name) {
                alreadyInArray = true;
                // check current item status down
                if (currentItem.status === "DOWN")
                  instancesArray[index].status = "DOWN";
              }
              return instance;
            });
            // check already in instancesArray
            if (!alreadyInArray) {
              console.log("currentItem:");
              console.log(currentItem);
              instancesArray.push({
                name: currentItem.name,
                data: currentItem.data,
                status: currentItem.data.status,
              });
            }
            return currentItem;
          });
          // compare old array to new array
          instancesArray.map((instance, index) => {
            let alreadyInArray = false;
            currentArray.map((currentItem) => {
              if (instance.name === currentItem.name) {
                alreadyInArray = true;
              }
              return currentItem;
            });
            if (!alreadyInArray) {
              instancesArray[index].status = "DOWN";
            } else {
              instancesArray[index].status = "UP";
            }
            return instance;
          });
          console.log("currentArray:");
          console.log(currentArray);
          setInstances(instancesArray);
        }
        // set total
        setTotal(instances.length);
        // set active and inactive
        const count = (status) => {
          let count = 0;
          instances.map((item) => {
            if (item.status === status) count++;
            return item;
          });
          return count;
        };
        setActive(count("UP"));
        setInActive(count("DOWN"));
        console.log("instances:");
        console.log(instances);
      })
      .catch((error) => {
        setConnected(0);
        console.log(error);
      })
      .then(() => {
        setTimeout(() => setConnected(2), 300);
      });
  };

  useEffect(() => {
    if (firstTime) {
      fetchData();
      setFirstTime(false);
      setInterval(() => fetchData(), 1500);
    }
  }, [firstTime, fetchData]);

  return (
    <Container className="container">
      <Row>
        <Col className="mt-3 mb-1">
          <div className="d-flex">
            <h2 className="d-inline">
              <FontAwesomeIcon icon={faLeaf} className="mr-2" />
              Eureka dashboard
            </h2>
            <span className="ml-auto d-inline">
              {connected === 0 && (
                <FontAwesomeIcon
                  icon={faCircle}
                  className="fa-xs text-danger"
                />
              )}
              {connected === 1 && (
                <FontAwesomeIcon
                  icon={faCircle}
                  className="fa-xs text-success"
                />
              )}
              {connected === 2 && (
                <FontAwesomeIcon icon={faCircle} className="fa-xs text-muted" />
              )}
            </span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card bg="primary" text="white">
            <Card.Body>
              <h4>
                <FontAwesomeIcon icon={faServer} className="mr-2" />
                Total
              </h4>
              <div>
                <h1 className="d-inline">{total}</h1>
                <h5 className="d-inline ml-2">node</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white">
            <Card.Body>
              <h4>
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Active
              </h4>
              <div>
                <h1 className="d-inline">{active}</h1>
                <h5 className="d-inline ml-2">node</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="danger" text="white">
            <Card.Body>
              <h4>
                <FontAwesomeIcon icon={faPlug} className="mr-2" />
                Inactive
              </h4>
              <div>
                <h1 className="d-inline">{inActive}</h1>
                <h5 className="d-inline ml-2">node</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className="mt-3">
          {active > 0 && (
            <Doughnut
              data={{
                labels: ["active", "inactive"],
                datasets: [
                  {
                    data: [active, inActive],
                    backgroundColor: ["#27a744", "#dd3444"],
                  },
                ],
              }}
              options={{
                position: "right",
                legend: {
                  position: "bottom",
                },
              }}
              height={60}
            />
          )}
        </Col>
      </Row>
      <Row>
        <Col className="mt-3">
          <Table>
            <thead>
              <tr>
                <th>
                  <FontAwesomeIcon icon={faDesktop} className="mr-2" />
                  Application Name
                </th>
                <th>
                  <FontAwesomeIcon icon={faEthernet} className="mr-2" />
                  Host
                </th>
                <th>
                  <FontAwesomeIcon icon={faHdd} className="mr-2" />
                  Instance
                </th>
                <th>
                  <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {total === 0 && (
                <tr>
                  <td>No instances available</td>
                </tr>
              )}
              {instances.map((item) => {
                return (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.data.hostName}</td>
                    <td>
                      {item.data.instanceId.substring(
                        item.data.instanceId.indexOf(":") + 1
                      )}
                    </td>
                    <td>
                      <Badge
                        variant={item.status === "UP" ? "success" : "danger"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

package com.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsonschema2pojo.*;
import org.jsonschema2pojo.rules.RuleFactory;

import com.sun.codemodel.JCodeModel;

import java.io.File;
import java.util.Iterator;
import java.util.Map;

public class PojoGenerator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        // Load your JSON
        String json = "{\n" +
                "    \"name\": \"Sabbu\",\n" +
                "    \"description\": \"\",\n" +
                "    \"version\": \"1.0.0\",\n" +
                "    \"status\": \"active\",\n" +
                "    \"bpmnContent\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<bpmn2:definitions xmlns:bpmn2=\\\"http://www.omg.org/spec/BPMN/20100524/MODEL\\\" xmlns:bpmndi=\\\"http://www.omg.org/spec/BPMN/20100524/DI\\\" xmlns:bpsim=\\\"http://www.bpsim.org/schemas/1.0\\\" xmlns:dc=\\\"http://www.omg.org/spec/DD/20100524/DC\\\" xmlns:di=\\\"http://www.omg.org/spec/DD/20100524/DI\\\" xmlns:drools=\\\"http://www.jboss.org/drools\\\" xmlns:xsi=\\\"xsi\\\" id=\\\"_PBDWIHhvED6jF5E03-fB0Q\\\" xsi:schemaLocation=\\\"http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd http://www.jboss.org/drools drools.xsd http://www.bpsim.org/schemas/1.0 bpsim.xsd http://www.omg.org/spec/DD/20100524/DC DC.xsd http://www.omg.org/spec/DD/20100524/DI DI.xsd \\\" exporter=\\\"jBPM Process Modeler\\\" exporterVersion=\\\"2.0\\\" targetNamespace=\\\"http://www.omg.org/bpmn20\\\">\\n  <bpmn2:process id=\\\"default\\\" drools:packageName=\\\"com.example\\\" drools:version=\\\"1.0\\\" drools:adHoc=\\\"false\\\" name=\\\"default\\\" isExecutable=\\\"true\\\" processType=\\\"Public\\\">\\n    <bpmn2:sequenceFlow id=\\\"start-to-end\\\" sourceRef=\\\"start-event\\\" targetRef=\\\"end-event\\\"/>\\n    <bpmn2:startEvent id=\\\"start-event\\\" name=\\\"Start\\\">\\n      <bpmn2:extensionElements>\\n        <drools:metaData name=\\\"elementname\\\">\\n          <drools:metaValue><![CDATA[Start]]></drools:metaValue>\\n        </drools:metaData>\\n      </bpmn2:extensionElements>\\n      <bpmn2:outgoing>start-to-end</bpmn2:outgoing>\\n    </bpmn2:startEvent>\\n    <bpmn2:endEvent id=\\\"end-event\\\" name=\\\"End\\\">\\n      <bpmn2:extensionElements>\\n        <drools:metaData name=\\\"elementname\\\">\\n          <drools:metaValue><![CDATA[End]]></drools:metaValue>\\n        </drools:metaData>\\n      </bpmn2:extensionElements>\\n      <bpmn2:incoming>start-to-end</bpmn2:incoming>\\n    </bpmn2:endEvent>\\n  </bpmn2:process>\\n  <bpmndi:BPMNDiagram>\\n    <bpmndi:BPMNPlane bpmnElement=\\\"default\\\">\\n      <bpmndi:BPMNShape id=\\\"shape_end-event\\\" bpmnElement=\\\"end-event\\\">\\n        <dc:Bounds height=\\\"56\\\" width=\\\"56\\\" x=\\\"300\\\" y=\\\"100\\\"/>\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"shape_start-event\\\" bpmnElement=\\\"start-event\\\">\\n        <dc:Bounds height=\\\"56\\\" width=\\\"56\\\" x=\\\"100\\\" y=\\\"100\\\"/>\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNEdge id=\\\"edge_shape_start-event_to_shape_end-event\\\" bpmnElement=\\\"start-to-end\\\">\\n        <di:waypoint x=\\\"136\\\" y=\\\"118\\\"/>\\n        <di:waypoint x=\\\"300\\\" y=\\\"118\\\"/>\\n      </bpmndi:BPMNEdge>\\n    </bpmndi:BPMNPlane>\\n  </bpmndi:BPMNDiagram>\\n  <bpmn2:relationship type=\\\"BPSimData\\\">\\n    <bpmn2:extensionElements>\\n      <bpsim:BPSimData>\\n        <bpsim:Scenario id=\\\"default\\\" name=\\\"Simulationscenario\\\">\\n          <bpsim:ScenarioParameters/>\\n          <bpsim:ElementParameters elementRef=\\\"start-event\\\">\\n            <bpsim:TimeParameters>\\n              <bpsim:ProcessingTime>\\n                <bpsim:NormalDistribution mean=\\\"0\\\" standardDeviation=\\\"0\\\"/>\\n              </bpsim:ProcessingTime>\\n            </bpsim:TimeParameters>\\n          </bpsim:ElementParameters>\\n        </bpsim:Scenario>\\n      </bpsim:BPSimData>\\n    </bpmn2:extensionElements>\\n    <bpmn2:source>_PBDWIHhvED6jF5E03-fB0Q</bpmn2:source>\\n    <bpmn2:target>_PBDWIHhvED6jF5E03-fB0Q</bpmn2:target>\\n  </bpmn2:relationship>\\n</bpmn2:definitions>\",\n" +
                "    \"dmnContent\": \"\",\n" +
                "    \"tags\": [],\n" +
                "    \"variables\": [],\n" +
                "    \"createdBy\": \"current-user\",\n" +
                "    \"builderNodes\": [\n" +
                "        {\n" +
                "            \"id\": \"6a878719-a447-4798-b5ca-64ea3eb43cb1\",\n" +
                "            \"type\": \"serviceNode\",\n" +
                "            \"position\": {\n" +
                "                \"x\": 105,\n" +
                "                \"y\": 135\n" +
                "            },\n" +
                "            \"data\": {\n" +
                "                \"nodeId\": \"6a878719-a447-4798-b5ca-64ea3eb43cb1\",\n" +
                "                \"service\": {\n" +
                "                    \"id\": \"2\",\n" +
                "                    \"name\": \"Create Post\",\n" +
                "                    \"description\": \"Create a new blog post\",\n" +
                "                    \"method\": \"POST\",\n" +
                "                    \"url\": \"https://jsonplaceholder.typicode.com/posts\",\n" +
                "                    \"headers\": {\n" +
                "                        \"Content-Type\": \"application/json\"\n" +
                "                    },\n" +
                "                    \"queryParams\": {},\n" +
                "                    \"body\": \"{\\\"title\\\": \\\"New Post\\\", \\\"body\\\": \\\"Post content\\\", \\\"userId\\\": 1}\",\n" +
                "                    \"bodyType\": \"json\",\n" +
                "                    \"auth\": {\n" +
                "                        \"type\": \"bearer\",\n" +
                "                        \"config\": {\n" +
                "                            \"token\": \"your-token-here\"\n" +
                "                        }\n" +
                "                    },\n" +
                "                    \"response\": {\n" +
                "                        \"status\": 201,\n" +
                "                        \"statusText\": \"Created\",\n" +
                "                        \"headers\": {\n" +
                "                            \"content-type\": \"application/json\"\n" +
                "                        },\n" +
                "                        \"body\": \"{\\\"id\\\": 101, \\\"title\\\": \\\"New Post\\\", \\\"body\\\": \\\"Post content\\\", \\\"userId\\\": 1}\",\n" +
                "                        \"responseTime\": 312,\n" +
                "                        \"size\": 256\n" +
                "                    },\n" +
                "                    \"createdAt\": \"2024-01-10T00:00:00.000Z\",\n" +
                "                    \"updatedAt\": \"2024-01-25T00:00:00.000Z\",\n" +
                "                    \"tags\": [\n" +
                "                        \"post\",\n" +
                "                        \"create\"\n" +
                "                    ]\n" +
                "                },\n" +
                "                \"mappingConfigured\": false\n" +
                "            },\n" +
                "            \"width\": 227,\n" +
                "            \"height\": 145,\n" +
                "            \"selected\": true,\n" +
                "            \"positionAbsolute\": {\n" +
                "                \"x\": 105,\n" +
                "                \"y\": 135\n" +
                "            },\n" +
                "            \"dragging\": false\n" +
                "        }\n" +
                "    ],\n" +
                "    \"builderEdges\": [],\n" +
                "    \"serviceMappings\": {\n" +
                "        \"6a878719-a447-4798-b5ca-64ea3eb43cb1\": {\n" +
                "            \"name\": \"Create Post\",\n" +
                "            \"method\": \"POST\",\n" +
                "            \"url\": \"https://jsonplaceholder.typicode.com/posts\",\n" +
                "            \"headers\": {\n" +
                "                \"Content-Type\": \"application/json\"\n" +
                "            },\n" +
                "            \"requestBody\": \"{\\\"title\\\": \\\"New Post\\\", \\\"body\\\": \\\"Post content\\\", \\\"userId\\\": 1}\",\n" +
                "            \"requestMapping\": [\n" +
                "                {\n" +
                "                    \"id\": \"3cf460e1-2ece-48b5-bc4e-6187c8e36a02\",\n" +
                "                    \"sourceField\": \"customer.id\",\n" +
                "                    \"targetField\": \"title\",\n" +
                "                    \"type\": \"direct\",\n" +
                "                    \"staticValue\": \"CUST-789\"\n" +
                "                },\n" +
                "                {\n" +
                "                    \"id\": \"69d2b9ff-fecb-4719-8316-5205f260ccf4\",\n" +
                "                    \"sourceField\": \"customer.name\",\n" +
                "                    \"targetField\": \"body\",\n" +
                "                    \"type\": \"direct\",\n" +
                "                    \"staticValue\": \"John Doe\"\n" +
                "                },\n" +
                "                {\n" +
                "                    \"id\": \"2056efb0-1eac-47be-b599-5260c799f6c2\",\n" +
                "                    \"sourceField\": \"customer.email\",\n" +
                "                    \"targetField\": \"userId\",\n" +
                "                    \"type\": \"direct\",\n" +
                "                    \"staticValue\": \"john.doe@example.com\"\n" +
                "                }\n" +
                "            ],\n" +
                "            \"responseMapping\": []\n" +
                "        }\n" +
                "    },\n" +
                "    \"initialRequestConfig\": {\n" +
                "        \"id\": \"1758386685514\",\n" +
                "        \"name\": \"Sabbu\",\n" +
                "        \"jsonSchema\": \"{\\n  \\\"orderId\\\": \\\"ORD-12345\\\",\\n  \\\"customer\\\": {\\n    \\\"id\\\": \\\"CUST-789\\\",\\n    \\\"name\\\": \\\"John Doe\\\",\\n    \\\"email\\\": \\\"john.doe@example.com\\\",\\n    \\\"phone\\\": \\\"+1-555-0123\\\"\\n  },\\n  \\\"items\\\": [\\n    {\\n      \\\"productId\\\": \\\"PROD-456\\\",\\n      \\\"name\\\": \\\"Premium Widget\\\",\\n      \\\"quantity\\\": 2,\\n      \\\"price\\\": 125.00,\\n      \\\"category\\\": \\\"electronics\\\"\\n    }\\n  ],\\n  \\\"payment\\\": {\\n    \\\"method\\\": \\\"credit_card\\\",\\n    \\\"status\\\": \\\"pending\\\",\\n    \\\"amount\\\": 250.00,\\n    \\\"currency\\\": \\\"USD\\\"\\n  },\\n  \\\"shipping\\\": {\\n    \\\"address\\\": {\\n      \\\"street\\\": \\\"123 Main St\\\",\\n      \\\"city\\\": \\\"Anytown\\\",\\n      \\\"state\\\": \\\"CA\\\",\\n      \\\"zipCode\\\": \\\"12345\\\",\\n      \\\"country\\\": \\\"USA\\\"\\n    },\\n    \\\"method\\\": \\\"standard\\\",\\n    \\\"trackingNumber\\\": null\\n  },\\n  \\\"metadata\\\": {\\n    \\\"source\\\": \\\"web\\\",\\n    \\\"timestamp\\\": \\\"2024-01-25T10:30:00Z\\\",\\n    \\\"version\\\": \\\"1.0\\\"\\n  }\\n}\",\n" +
                "        \"sampleData\": {\n" +
                "            \"orderId\": \"ORD-12345\",\n" +
                "            \"customer\": {\n" +
                "                \"id\": \"CUST-789\",\n" +
                "                \"name\": \"John Doe\",\n" +
                "                \"email\": \"john.doe@example.com\",\n" +
                "                \"phone\": \"+1-555-0123\"\n" +
                "            },\n" +
                "            \"items\": [\n" +
                "                {\n" +
                "                    \"productId\": \"PROD-456\",\n" +
                "                    \"name\": \"Premium Widget\",\n" +
                "                    \"quantity\": 2,\n" +
                "                    \"price\": 125,\n" +
                "                    \"category\": \"electronics\"\n" +
                "                }\n" +
                "            ],\n" +
                "            \"payment\": {\n" +
                "                \"method\": \"credit_card\",\n" +
                "                \"status\": \"pending\",\n" +
                "                \"amount\": 250,\n" +
                "                \"currency\": \"USD\"\n" +
                "            },\n" +
                "            \"shipping\": {\n" +
                "                \"address\": {\n" +
                "                    \"street\": \"123 Main St\",\n" +
                "                    \"city\": \"Anytown\",\n" +
                "                    \"state\": \"CA\",\n" +
                "                    \"zipCode\": \"12345\",\n" +
                "                    \"country\": \"USA\"\n" +
                "                },\n" +
                "                \"method\": \"standard\",\n" +
                "                \"trackingNumber\": null\n" +
                "            },\n" +
                "            \"metadata\": {\n" +
                "                \"source\": \"web\",\n" +
                "                \"timestamp\": \"2024-01-25T10:30:00Z\",\n" +
                "                \"version\": \"1.0\"\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "}";

        JsonNode root = MAPPER.readTree(json);

        // Generate POJOs for initialRequestConfig.jsonSchema
        String initialSchema = root.get("initialRequestConfig").get("jsonSchema").asText();
        generateFromJson(initialSchema, "com.template.initial", new File("output/InitialRequest"));

        // Iterate builderNodes → service → body + response.body
        Iterator<JsonNode> builderNodes = root.get("builderNodes").elements();
        while (builderNodes.hasNext()) {
            JsonNode node = builderNodes.next();
            JsonNode service = node.get("data").get("service");
            String serviceName = service.get("name").asText().replaceAll("\\s+", "");

            // Request body
            if (service.hasNonNull("body") && !service.get("body").asText().isEmpty()) {
                String bodyJson = service.get("body").asText();
                generateFromJson(bodyJson, "com.template.services." + serviceName, new File("output/" + serviceName + "/Request"));
            }

            // Response body
            if (service.has("response") && service.get("response").hasNonNull("body")) {
                String responseBody = service.get("response").get("body").asText();
                generateFromJson(responseBody, "com.template.services." + serviceName, new File("output/" + serviceName + "/Response"));
            }
        }

        System.out.println("POJOs generated successfully.");
    }

    private static void generateFromJson(String json, String packageName, File outputDir) throws Exception {
        JCodeModel codeModel = new JCodeModel();

        GenerationConfig config = new DefaultGenerationConfig() {
            @Override public boolean isGenerateBuilders() { return true; }
            @Override public SourceType getSourceType() { return SourceType.JSON; }
            @Override public boolean isIncludeAdditionalProperties() { return false; } // disables Map<String,Object>
        };

        SchemaMapper mapper = new SchemaMapper(new RuleFactory(config, new NoopAnnotator(), new SchemaStore()), new SchemaGenerator());
        mapper.generate(codeModel, "Root", packageName, json);

        outputDir.mkdirs();
        codeModel.build(outputDir);
    }
}

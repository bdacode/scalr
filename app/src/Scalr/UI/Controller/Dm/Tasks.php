<?php
use Scalr\Acl\Acl;

class Scalr_UI_Controller_Dm_Tasks extends Scalr_UI_Controller
{
    const CALL_PARAM_NAME = 'deploymentTaskId';

    public function hasAccess()
    {
        return parent::hasAccess() && $this->request->isAllowed(Acl::RESOURCE_DEPLOYMENTS_TASKS);
    }

    public function defaultAction()
    {
        $this->viewAction();
    }

    public function viewAction()
    {
        $this->response->page('ui/dm/tasks/view.js');
    }

    public function deployAction()
    {
        $this->request->defineParams(array(
            'deploymentTaskId' => array('type' => 'string')
        ));

        $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($this->getParam('deploymentTaskId'));
        $this->user->getPermissions()->validate($deploymentTask);

        $deploymentTask->deploy();

        $this->response->success("Deployment successfully initiated");
    }

    public function failureDetailsAction()
    {
        $this->request->defineParams(array(
            'deploymentTaskId' => array('type' => 'string')
        ));

        $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($this->getParam('deploymentTaskId'));
        $this->user->getPermissions()->validate($deploymentTask);

        $this->response->page('ui/dm/tasks/failuredetails.js', array(
            'last_error' => $deploymentTask->lastError ? $deploymentTask->lastError : "Unknown"
        ));
    }

    public function xListLogsAction()
    {
        $this->request->defineParams(array(
            'deployTaskId' => array('type' => 'text'),
            'sort' => array('type' => 'json', 'default' => array('property' => 'id', 'direction' => 'DESC'))
        ));

        $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($this->getParam('deploymentTaskId'));
        $this->user->getPermissions()->validate($deploymentTask);

        $sql = "SELECT * FROM dm_deployment_task_logs WHERE dm_deployment_task_id = " . $this->db->qstr($this->getParam('deploymentTaskId'));
        $response = $this->buildResponseFromSql($sql, array("message"));
        foreach ($response['data'] as &$row) {
            $row['dtadded'] = Scalr_Util_DateTime::convertTz($row["dtadded"]);
        }

        $this->response->data($response);
    }

    public function logsAction()
    {
        $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($this->getParam('deploymentTaskId'));
        $this->user->getPermissions()->validate($deploymentTask);

        $this->response->page('ui/dm/tasks/logs.js');
    }

    public function xRemoveTasksAction()
    {
        $this->request->defineParams(array(
            'deploymentTaskId' => array('type' => 'string')
        ));

        $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($this->getParam('deploymentTaskId'));
        $this->user->getPermissions()->validate($deploymentTask);

        $deploymentTask->delete();

        $this->response->success();
    }

    public function xListTasksAction()
    {
        $this->request->defineParams(array(
            'sort' => array('type' => 'json', 'default' => array('property' => 'dtadded', 'direction' => 'DESC'))
        ));

        $sql = "
            SELECT
                dt.id, dma.name AS application_name, servers.index AS server_index, farms.name AS farm_name, roles.name AS role_name,
                dt.status AS status, dt.dtadded AS dtadded
            FROM dm_deployment_tasks dt
            LEFT JOIN dm_applications dma ON dt.dm_application_id = dma.id
            LEFT JOIN servers ON servers.id = dt.server_id
            LEFT JOIN farms ON servers.farm_id = farms.id
            LEFT JOIN roles ON servers.farm_roleid = roles.id
            WHERE dt.`status` != ? AND dt.env_id = ?
        ";

        $allFarms = $this->request->isAllowed(Acl::RESOURCE_FARMS, Acl::PERM_FARMS_NOT_OWNED_FARMS);
        if (!$allFarms) {
            //join becomes inner
            $sql .= " AND farms.created_by_id = " . $this->db->qstr($this->user->getId()) . " ";
        }

        $response = $this->buildResponseFromSql2($sql, array('id', 'application_name', 'farm_name', 'role_name', 'server_index', 'status', 'dtadded', 'dtdeployed'),
            array(), array(Scalr_Dm_DeploymentTask::STATUS_ARCHIVED, $this->getEnvironmentId()));

        foreach ($response["data"] as $k => $row) {
            $data = false;
            try {
                $deploymentTask = Scalr_Dm_DeploymentTask::init()->loadById($row['id']);
                $application = $deploymentTask->getApplication();

                try {
                    $dbServer = DBServer::LoadByID($deploymentTask->serverId);
                    $serverIndex = $dbServer->index;
                } catch (Exception $e) {
                }

                $data = array(
                    'id'				=> $deploymentTask->id,
                    'application_name' 	=> $application->name,
                    'application_id'	=> $deploymentTask->applicationId,
                    'server_id'			=> $deploymentTask->serverId,
                    'server_index'		=> $serverIndex,
                    'remote_path'		=> $deploymentTask->remotePath,
                    'status'			=> $deploymentTask->status,
                    'dtadded'			=> $deploymentTask->dtAdded ? Scalr_Util_DateTime::convertTz($deploymentTask->dtAdded) : "",
                    'dtdeployed'		=> $deploymentTask->dtDeployed ? Scalr_Util_DateTime::convertTz($deploymentTask->dtDeployed) : "Never"
                );

                try {
                    $dbFarmRole = DBFarmRole::LoadByID($deploymentTask->farmRoleId);

                    $data['farm_roleid'] = $dbFarmRole->ID;
                    $data['role_name'] = $dbFarmRole->GetRoleObject()->name;
                    $data['farm_id'] = $dbFarmRole->FarmID;
                    $data['farm_name'] = $dbFarmRole->GetFarmObject()->Name;
                } catch (Exception $e) {
                }
            } catch (Exception $e) {
            }

            $response["data"][$k] = $data;
        }

        $this->response->data($response);
    }
}

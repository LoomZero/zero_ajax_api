<?php

namespace Drupal\zero_ajax_api\Plugin\ZeroAjax;

use Drupal\zero_ajax_api\Annotation\ZeroAjax;
use Drupal\zero_ajax_api\Exception\ZeroAjaxAPIRuntimeException;
use Drupal\zero_ajax_api\ZeroAjaxBase;
use Drupal\zero_ajax_api\ZeroAjaxRequest;

/**
 * @ZeroAjax(
 *   id = "views",
 *   params = {
 *     "view" = "+string",
 *     "display" = "+string",
 *     "pager" = {
 *       "offset" = "number:0",
 *       "items" = "number:10",
 *       "page" = "number:0",
 *       "ok" = "+string",
 *     },
 *   },
 * )
 */
class DefaultZeroAjax extends ZeroAjaxBase {

  public function response(ZeroAjaxRequest $request) {
    $request->setMeta('info', $request->getParams()['display']);

    $request->setMessage('note', 'Hallo');
    return [
      $request->getParams()['pager']['ok'],
    ];
  }

}

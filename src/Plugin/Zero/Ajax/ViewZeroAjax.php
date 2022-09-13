<?php

namespace Drupal\zero_ajax_api\Plugin\ZeroAjax;

use Drupal\zero_ajax_api\Annotation\ZeroAjax;
use Drupal\zero_ajax_api\ZeroAjaxBase;
use Drupal\zero_ajax_api\ZeroAjaxRequest;
use Drupal\zero_entitywrapper\View\ViewWrapper;

/**
 * @ZeroAjax(
 *   id = "view",
 *   params = {
 *     "view" = "+string",
 *     "display" = "+string",
 *     "identifier" = "string",
 *     "pager" = {
 *       "offset" = "number:-1",
 *       "items" = "number:-1",
 *       "page" = "number:0",
 *     },
 *     "filters" = "array",
 *     "render" = "string:teaser",
 *   },
 * )
 */
class ViewZeroAjax extends ZeroAjaxBase {

  public function response(ZeroAjaxRequest $request) {
    $view = ViewWrapper::create($request->getParams()['view'] . ':' . $request->getParams()['display']);

    $view->setExposedInput($request->getParams()['filters'] ?: []);

    $view->setFullPager();
    $pager = $request->getParams()['pager'];
    foreach ($pager as $index => $value) {
      if ($value === -1) $pager[$index] = NULL;
    }
    $view->setPagerConfig($pager);

    $results = $view->getContentResults();

    foreach ($results as $index => $result) {
      $results[$index] = $this->render($result->render($request->getParams()['render']));
    }

    $request->setMeta('results', $view->getResultMeta());

    return [
      'params' => $request->getParams(),
      'results' => $results,
    ];
  }

}

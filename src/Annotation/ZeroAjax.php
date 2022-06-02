<?php

namespace Drupal\zero_ajax_api\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a Task plugin item annotation object.
 *
 * @see \Drupal\zero_ajax_api\ZeroAjaxPluginManager
 * @see plugin_api
 *
 * @Annotation
 */
class ZeroAjax extends Plugin {

  /** @var string */
  public $id;

  /** @var array */
  public $params;

}

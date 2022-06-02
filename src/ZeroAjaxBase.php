<?php

namespace Drupal\zero_ajax_api;

use Drupal\Core\Plugin\PluginBase;
use Drupal\zero_ajax_api\Exception\ZeroAjaxAPIDefinitionException;

abstract class ZeroAjaxBase extends PluginBase implements ZeroAjaxInterface {

  protected $paramsDefinitions = NULL;

  public function getParamDefinitions() {
    if ($this->paramsDefinitions === NULL) {
      $this->paramsDefinitions = [];
      $this->buildParams($this->paramsDefinitions, $this->getPluginDefinition()['params']);
    }
    return $this->paramsDefinitions;
  }

  private function buildParams(&$definitions, $params) {
    foreach ($params as $key => $value) {
      $definitions[$key] = [];
      if (is_string($value)) {
        if (str_starts_with($value, '+')) {
          $value = substr($value, 1);
          $definitions[$key]['_required'] = TRUE;
        } else {
          $definitions[$key]['_required'] = FALSE;
        }
        $parts = explode(':', $value);

        if (count($parts) === 2) {
          list($type, $fallback) = $parts;
        } else {
          list($type) = $parts;
          $fallback = NULL;
        }
        $definitions[$key]['_type'] = $type;
        $definitions[$key]['_fallback'] = $fallback;
      } else if (is_array($value)) {
        if (isset($value['_type'])) {
          $definitions[$key]['_type'] = $value['_type'];
          if (isset($value['_fallback'])) {
            $definitions[$key]['_fallback'] = $value['_fallback'];
          }
        } else {
          $definitions[$key]['_children'] = [];
          $this->buildParams($definitions[$key]['_children'], $value);
        }
      }
      if (isset($definitions[$key]['_required']) && $definitions[$key]['_required'] && isset($definitions[$key]['_fallback']) && $definitions[$key]['_fallback'] !== NULL) {
        throw new ZeroAjaxAPIDefinitionException('invalid.parameter.require', 'The parameter "' . $key . '" is required but have a fallback value.');
      }
    }
  }

}

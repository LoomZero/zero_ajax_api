<?php

namespace Drupal\zero_ajax_api;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

class ZeroAjaxPluginManager extends DefaultPluginManager {

  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct('Plugin/Zero/Ajax', $namespaces, $module_handler,
      'Drupal\zero_ajax_api\ZeroAjaxInterface',
      'Drupal\zero_ajax_api\Annotation\ZeroAjax');

    $this->alterInfo('zero_ajax_info');
    $this->setCacheBackend($cache_backend, 'zero_ajax_info');
  }

}

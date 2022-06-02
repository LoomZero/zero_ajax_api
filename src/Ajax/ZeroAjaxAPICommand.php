<?php

namespace Drupal\zero_ajax_api\Ajax;

use Drupal\Core\Ajax\CommandInterface;

class ZeroAjaxAPICommand implements CommandInterface {

  private array $data;
  private array $meta;
  private ?int $code = NULL;

  public function __construct(array $data, array $meta = [], int $code = 200) {
    $this->data = $data;
    $this->meta = $meta;
    $this->code = $code;
  }

  public function render() {
    return [
      'command' => 'zeroAjaxAPICommand',
      'data' => $this->data,
      'meta' => $this->meta,
      'code' => $this->code,
    ];
  }

}

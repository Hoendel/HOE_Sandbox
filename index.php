<?php
/* TIMELINE Generator */

// retrieve data
$folder = __DIR__ . '/dictionary/docs_sample/timelines';
$timelines = [
    $folder . '/welt.md',  
    $folder . '/nand.md', 
    $folder . '/nand-als-cephaloid.md', 
];

// generate event array
$eventsAll = [];
foreach ($timelines as $filename) {
    $eventsAll = [...$eventsAll, ...getEvents($filename)];
}
$eventsAll = array_unique($eventsAll);
ksort($eventsAll);
// print_R($eventsAll);

// save event array
touch($folder . '/gesamtuebersicht.md');
file_put_contents($folder . '/gesamtuebersicht.md', implode("\n\n", $eventsAll));


/* FILE Generator */
if (isset($_GET['recreateFile'])) {
    // retrieve data
    $folder = __DIR__ . '/odt';
    $files = array_filter(scandir($folder), function($item) {return !in_array($item, ['.', '..',]); });
    foreach ($files as $fileName) {
        $filename = str_replace('.odt', '', __DIR__ . '/dictionary/docs_sample/geschichte/' . $fileName . '.md');
        if (file_exists($filename)) {
            continue;
        }
        touch($filename);
    }
}

/* FUNKTIONEN START */
function getEvents($filename): array
{
    $content = file_get_contents($filename);
    return getEventsFromString($content);
}
function getEventsFromString($string): array
{
    $eventsRaw = explode('##', $string);
    $events = [];
    foreach ($eventsRaw as $event) {
        $year = trim(substr($event, strpos($event, '##') + 1, 4));
        $month = trim(substr($event, 2, 2));
        if (!is_numeric($month)) {
            $month = '00';
        }
        $month = str_pad($month, 2, STR_PAD_LEFT);
        $events[$year . '-' . $month . '-' . uniqid()] = $event;
    }
    $events = array_filter($events, function($item) { return is_numeric(substr($item, 0,4));});

    // mark first line of event as headline
    array_walk($events, function(&$item) {$item = '##' . $item;});
    return $events;
}




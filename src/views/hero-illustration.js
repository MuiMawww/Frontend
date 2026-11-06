import { GEAR_STROKE, gearOutline, gearTrain } from './gear-geometry.js';
const source = '/assets/illustrations/scientist-original.png';
function gear(item) {
  const rotation = item.phase * 180 / Math.PI;
  return '<g data-gear="' + item.id + '" transform="translate(' + item.x + ' ' + item.y + ') rotate(' + rotation + ')">'
    + '<path class="hero-gear" style="--gear-period:' + item.period + 's;--gear-direction:' + (item.direction > 0 ? 'normal' : 'reverse')
    + '" d="' + gearOutline(item.teeth, item.holeRatio) + '" fill="' + item.color
    + '" fill-rule="evenodd" stroke="#171717" stroke-width="' + GEAR_STROKE + '" stroke-linejoin="round"/></g>';
}
export function heroIllustration() {
  return `<svg class="hero-scientist" viewBox="-70 -70 1740 1670" role="img" aria-label="Робот-учёный: вращающиеся шестерёнки и светящаяся лампа">
    <circle class="hero-circle" cx="800" cy="800" r="780" fill="url(#hero-circle-light)"/>
    <defs>
      <radialGradient id="hero-circle-light" cx="50%" cy="48%" r="52%"><stop offset="0" stop-color="white"/><stop offset=".42" stop-color="white" stop-opacity=".92"/><stop offset="1" stop-color="var(--cream)"/></radialGradient>
      <mask id="scientist-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1600">
        <rect width="1600" height="1600" fill="white"/>
        <path d="M0 0H1600V235L866 340V780H475V850H0Z" fill="black"/><rect x="770" y="270" width="115" height="73" fill="black"/>
        <!-- Foreground contours sampled from the full-resolution source; original pixels are preserved. -->
        <path d="M810.63 376.25L791.25 378.75L765.00 385.00L745.63 391.25L733.75 396.25L712.50 407.50L693.75 420.00L687.50 425.00L686.88 430.00L680.00 431.25L673.13 437.50L656.88 455.00L656.25 461.25L651.25 462.50L650.00 463.75L637.50 483.75L628.75 503.75L623.13 521.25L622.50 527.50L621.25 528.75L620.63 532.50L620.00 542.50L604.38 560.00L601.88 565.00L601.88 568.75L595.00 570.00L584.38 581.25L582.50 583.75L581.25 590.00L581.25 646.25L582.50 650.00L582.50 660.00L583.75 675.00L585.00 677.50L585.00 687.50L587.50 692.50L592.50 698.75L598.13 703.75L606.25 705.00L606.25 710.00L608.75 713.75L614.38 720.00L622.50 726.25L631.88 730.00L641.88 731.25L641.88 736.25L643.75 741.25L648.75 751.25L656.25 762.50L676.25 783.75L691.25 795.00L717.50 810.00L758.75 826.25L766.25 828.75L785.63 832.50L806.88 835.00L844.38 835.00L878.75 830.00L900.00 823.75L931.25 811.25L953.75 798.75L971.88 786.25L990.63 767.50L1004.38 747.50L1009.38 736.25L1009.38 731.25L1019.38 730.00L1028.75 726.25L1032.50 723.75L1043.13 712.50L1044.38 710.00L1045.63 700.00L1045.63 658.75L1046.88 652.50L1048.13 580.00L1049.38 577.50L1049.38 563.75L1036.25 547.50L1030.63 542.50L1030.63 532.50L1023.75 507.50L1019.38 496.25L1009.38 476.25L1000.63 463.75L994.38 462.50L994.38 455.00L984.38 443.75L971.25 431.25L964.38 430.00L963.75 425.00L955.63 418.75L936.88 406.25L914.38 395.00L885.63 385.00L860.00 378.75L840.63 376.25Z" fill="white"/><path d="M397.50 512.50L392.50 515.00L389.38 520.00L388.13 526.25L387.50 556.25L388.13 571.25L389.38 576.25L390.00 606.25L368.13 607.50L360.00 611.25L355.63 615.00L355.63 620.00L350.00 621.25L337.50 630.00L335.00 635.00L335.00 640.00L327.50 642.50L321.88 647.50L316.25 656.25L313.13 667.50L313.13 683.75L316.25 702.50L318.75 708.75L321.25 720.00L326.88 735.00L335.63 748.75L342.50 755.00L351.25 760.00L358.13 762.50L358.13 770.00L359.38 772.50L345.63 773.75L345.63 786.25L347.50 791.25L347.50 795.00L343.13 796.25L336.25 808.75L333.75 816.25L333.75 827.50L335.63 830.00L335.63 842.50L337.50 846.25L337.50 848.75L348.75 883.75L350.00 885.00L350.00 887.50L352.50 892.50L352.50 895.00L353.75 896.25L361.25 918.75L518.13 918.75L518.13 912.50L516.25 907.50L503.13 883.75L501.25 877.50L495.63 867.50L486.88 847.50L486.88 845.00L484.38 841.25L471.88 806.25L471.88 803.75L469.38 797.50L468.75 791.25L465.63 783.75L461.88 768.75L449.38 767.50L447.50 752.50L444.38 745.00L436.25 743.75L445.00 735.00L451.25 726.25L455.63 718.75L460.00 707.50L460.00 703.75L461.88 698.75L464.38 683.75L464.38 663.75L461.88 652.50L453.75 640.00L450.63 637.50L433.13 633.75L432.50 607.50L431.25 605.00L430.00 571.25L426.25 540.00L422.50 523.75L418.13 515.00L412.50 512.50Z" fill="white"/>
      </mask>
      <clipPath id="source-lamp"><path d="M610 -10H1040V215L960 300H880V338H780V295L735 280L610 270Z"/></clipPath>
      <clipPath id="source-lamp-body"><path d="M730 78H923V240L880 275V338H780V270L730 235Z"/></clipPath>
      <clipPath id="source-lamp-rays"><path clip-rule="evenodd" d="M610 -10H1040V215L960 300H880V338H780V295L735 280L610 270Z M730 78H923V240L880 275V338H780V270L730 235Z"/></clipPath>
      <clipPath id="ray-reveal"><circle class="ray-reveal" cx="825" cy="175" r="245"/></clipPath>
      <!-- Eye apertures follow the inside of the original black rims. -->
      <clipPath id="robot-left-eye" clipPathUnits="userSpaceOnUse"><path d="M717.50 610.00L705.00 612.50L698.13 615.00L690.00 620.00L681.88 627.50L677.50 633.75L677.50 635.00L675.00 638.75L675.00 641.25L673.75 643.75L673.75 647.50L672.50 650.00L673.13 652.50L672.50 662.50L673.75 665.00L673.75 667.50L675.00 671.25L679.38 680.00L681.88 683.75L687.50 690.00L696.88 696.25L704.38 700.00L715.63 703.75L723.13 705.00L745.00 705.00L752.50 703.75L760.00 701.25L768.13 697.50L775.63 692.50L781.88 686.25L786.88 677.50L789.38 670.00L789.38 665.00L790.63 662.50L790.63 648.75L789.38 647.50L789.38 645.00L783.13 633.75L773.75 623.75L766.25 618.75L761.25 616.25L743.13 611.25L735.00 610.00Z"/></clipPath>
      <clipPath id="robot-right-eye" clipPathUnits="userSpaceOnUse"><path d="M915.63 610.00L898.13 613.75L887.50 617.50L880.63 621.25L871.88 628.75L866.25 636.25L862.50 643.75L860.00 652.50L860.00 657.50L860.63 658.75L861.25 667.50L862.50 670.00L862.50 672.50L865.00 680.00L871.25 688.75L878.75 695.00L885.00 698.75L898.75 703.75L905.63 705.00L928.13 705.00L943.75 701.25L954.38 696.25L961.88 691.25L969.38 683.75L971.88 680.00L974.38 675.00L974.38 673.75L975.63 672.50L976.88 668.75L976.88 666.25L978.13 663.75L978.13 648.75L976.88 646.25L976.88 641.25L974.38 636.25L974.38 635.00L970.00 628.75L962.50 621.25L957.50 617.50L945.63 612.50L933.75 610.00Z"/></clipPath>
    </defs>
    ${gearTrain.map(gear).join('')}
    <image href="${source}" width="1600" height="1600" mask="url(#scientist-base)"/>
    <g class="robot-expression">
      <g class="robot-blink" aria-hidden="true">
        <g clip-path="url(#robot-left-eye)">
          <g class="robot-eyelid">
            <path d="M660 475H810V708Q735 734 660 708Z" fill="#d5d5d5"/>
            <path d="M660 708Q735 734 810 708" fill="none" stroke="#222" stroke-width="4"/>
          </g>
        </g>
        <g clip-path="url(#robot-right-eye)">
          <g class="robot-eyelid">
            <path d="M844 475H992V708Q918 734 844 708Z" fill="#d5d5d5"/>
            <path d="M844 708Q918 734 992 708" fill="none" stroke="#222" stroke-width="4"/>
          </g>
        </g>
      </g>
    </g>
    <g class="floating-bulb" clip-path="url(#source-lamp)">
      <image href="${source}" width="1600" height="1600" clip-path="url(#source-lamp-body)"/>
      <g class="source-light-rays"><g clip-path="url(#ray-reveal)"><image href="${source}" width="1600" height="1600" clip-path="url(#source-lamp-rays)"/></g></g>
    </g>
  </svg>`;
}

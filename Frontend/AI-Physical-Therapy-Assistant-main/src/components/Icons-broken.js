import React from 'react';

export function ArrowLeft ()
{
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
}

export function Pause ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M15 9H9V15H15V9Z" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function ArrowRight ()
{
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
}

export function Play ()
{
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  )
}

export function AiPlay ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M6.875 15V7.03005C6.875 4.56255 9.6 3.06755 11.68 4.39505L24.18 12.3651C26.1062 13.5938 26.1062 16.4063 24.18 17.635L11.68 25.605C9.6 26.9313 6.875 25.4375 6.875 22.97V15Z" stroke="#4F46E5" stroke-width="2" stroke-linejoin="round" />
    </svg>
  )
}

export function SummarySessionIcon () 
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
      <path d="M15.4768 13.3901L16.9918 21.9161C17.0087 22.0165 16.9946 22.1197 16.9514 22.2119C16.9081 22.3041 16.8377 22.3808 16.7497 22.4319C16.6616 22.483 16.56 22.506 16.4586 22.4978C16.3571 22.4897 16.2605 22.4507 16.1818 22.3861L12.6018 19.6991C12.4289 19.57 12.219 19.5003 12.0033 19.5003C11.7875 19.5003 11.5776 19.57 11.4048 19.6991L7.81875 22.3851C7.74007 22.4496 7.64361 22.4885 7.54225 22.4967C7.44088 22.5049 7.33942 22.482 7.25141 22.431C7.16341 22.38 7.09303 22.3035 7.04967 22.2115C7.00631 22.1195 6.99204 22.0165 7.00875 21.9161L8.52275 13.3901" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 14.5C15.3137 14.5 18 11.8137 18 8.5C18 5.18629 15.3137 2.5 12 2.5C8.68629 2.5 6 5.18629 6 8.5C6 11.8137 8.68629 14.5 12 14.5Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}
// Icon components for the summary page
export function Calendar ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function Clock ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M12.3999 22C17.9228 22 22.3999 17.5228 22.3999 12C22.3999 6.47715 17.9228 2 12.3999 2C6.87705 2 2.3999 6.47715 2.3999 12C2.3999 17.5228 6.87705 22 12.3999 22Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12.3999 6V12L16.3999 14" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function BarChart3 ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M12.7998 20V10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M18.7998 20V4" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6.7998 20V16" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function Repeat ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4.00048 14C3.81125 14.0007 3.62571 13.9476 3.46543 13.847C3.30516 13.7464 3.17671 13.6024 3.09503 13.4317C3.01335 13.261 2.98177 13.0706 3.00398 12.8827C3.02619 12.6948 3.10126 12.517 3.22048 12.37L13.1205 2.17004C13.1947 2.08432 13.2959 2.0264 13.4075 2.00577C13.519 1.98515 13.6342 2.00305 13.7342 2.05654C13.8342 2.11004 13.9131 2.19594 13.9578 2.30015C14.0026 2.40436 14.0106 2.52069 13.9805 2.63004L12.0605 8.65004C12.0039 8.80157 12.0161 8.96456 12.0051 9.12505C12.0253 9.28554 12.0841 9.43872 12.1766 9.57147C12.269 9.70421 12.3923 9.81256 12.5358 9.8872C12.6793 9.96185 12.8387 10.0006 13.0005 10H20.0005C20.1897 9.9994 20.3752 10.0525 20.5355 10.1531C20.6958 10.2537 20.8242 10.3977 20.9059 10.5684C20.9876 10.7391 21.0192 10.9295 20.997 11.1174C20.9748 11.3053 20.8997 11.4831 20.7805 11.63L10.8805 21.83C10.8062 21.9158 10.705 21.9737 10.5935 21.9943C10.482 22.0149 10.3668 21.997 10.2668 21.9435C10.1667 21.89 10.0879 21.8041 10.0431 21.6999C9.9984 21.5957 9.9904 21.4794 10.0205 21.37L11.9405 15.35C11.9971 15.1985 12.0161 15.0355 11.9959 14.875C11.9757 14.7146 11.9168 14.5614 11.8244 14.4286C11.732 14.2959 11.6087 14.1875 11.4652 14.1129C11.3217 14.0382 11.1622 13.9995 11.0005 14H4.00048Z" stroke="#4F46E5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function TrendingUp ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M22.3999 7L13.8999 15.5L8.8999 10.5L2.3999 17" stroke="#FB923C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M16.3999 7H22.3999V13" stroke="#FB923C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function CheckCircle ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 11L12 14L22 4" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function AlertTriangle ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.7205 8.29714C10.6485 7.52571 11.243 6.85714 12 6.85714C12.757 6.85714 13.3505 7.52469 13.2795 8.29714L12.7714 12.5657C12.756 12.7604 12.6683 12.9423 12.5255 13.0755C12.3828 13.2088 12.1953 13.2838 12 13.2857C11.8047 13.2838 11.6172 13.2088 11.4745 13.0755C11.3317 12.9423 11.244 12.7604 11.2286 12.5657L10.7205 8.29714ZM13.2857 15.8571C13.2857 16.1981 13.1503 16.5252 12.9091 16.7663C12.668 17.0074 12.341 17.1429 12 17.1429C11.659 17.1429 11.332 17.0074 11.0909 16.7663C10.8497 16.5252 10.7143 16.1981 10.7143 15.8571C10.7143 15.5162 10.8497 15.1891 11.0909 14.948C11.332 14.7069 11.659 14.5714 12 14.5714C12.341 14.5714 12.668 14.7069 12.9091 14.948C13.1503 15.1891 13.2857 15.5162 13.2857 15.8571Z" fill="#CA8A04" />
      <path d="M3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.3869 21 12 21C9.61305 21 7.32387 20.0518 5.63604 18.364C3.94821 16.6761 3 14.3869 3 12ZM12 4.54286C11.0207 4.54286 10.051 4.73574 9.14628 5.1105C8.24153 5.48525 7.41946 6.03454 6.727 6.727C6.03454 7.41946 5.48525 8.24153 5.1105 9.14628C4.73574 10.051 4.54286 11.0207 4.54286 12C4.54286 12.9793 4.73574 13.949 5.1105 14.8537C5.48525 15.7585 6.03454 16.5805 6.727 17.273C7.41946 17.9655 8.24153 18.5147 9.14628 18.8895C10.051 19.2643 11.0207 19.4571 12 19.4571C13.9778 19.4571 15.8745 18.6715 17.273 17.273C18.6715 15.8745 19.4571 13.9778 19.4571 12C19.4571 10.0222 18.6715 8.12549 17.273 6.727C15.8745 5.32852 13.9778 4.54286 12 4.54286Z" fill="#CA8A04" />
    </svg>
  )
}

export function User ()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15.4772 12.89L16.9922 21.416C17.0092 21.5164 16.9951 21.6196 16.9519 21.7118C16.9086 21.8039 16.8382 21.8807 16.7502 21.9318C16.6621 21.9829 16.5605 22.0059 16.459 21.9977C16.3576 21.9895 16.261 21.9506 16.1822 21.886L12.6022 19.199C12.4294 19.0699 12.2195 19.0001 12.0037 19.0001C11.788 19.0001 11.5781 19.0699 11.4052 19.199L7.81924 21.885C7.74056 21.9494 7.6441 21.9884 7.54273 21.9966C7.44137 22.0048 7.33991 21.9818 7.2519 21.9309C7.16389 21.8799 7.09352 21.8033 7.05016 21.7113C7.0068 21.6194 6.99253 21.5163 7.00924 21.416L8.52324 12.89" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14Z" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function ExternalLink ()
{
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  )
}

export function Volume2 ()
{
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  )
}

export function VolumeX ()
{
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  )
}

export function RotateCcw ()
{
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.2899 3.8599L1.8199 18C1.64536 18.3024 1.55296 18.6453 1.55201 18.9945C1.55106 19.3437 1.6416 19.6871 1.81442 19.9905C1.98723 20.2939 2.23639 20.5467 2.53679 20.7239C2.83719 20.901 3.17938 20.9962 3.5299 20.9999H20.4699C20.8204 20.9962 21.1626 20.901 21.463 20.7239C21.7634 20.5467 22.0126 20.2939 22.1854 19.9905C22.3582 19.6871 22.4487 19.3437 22.4478 18.9945C22.4468 18.6453 22.3544 18.3024 22.1799 18L13.7099 3.8599C13.5315 3.56608 13.2817 3.32311 12.9823 3.15441C12.6829 2.98571 12.3447 2.89731 11.9999 2.89731C11.6551 2.89731 11.3169 2.98571 11.0175 3.15441C10.7181 3.32311 10.4683 3.56608 10.2899 3.8599V3.8599Z" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 9H9V15H15V9Z" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 5H9v14h6V5z" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M24.375 6.875V15C24.375 22.97 16.5625 25.6875 12.4375 27.4375C12.1875 27.4375 11.8125 27.4375 11.5625 27.4375C7.4375 25.6875 5.625 22.97 5.625 15V6.875C5.625 6.875 7.03125 6.875 9.6875 6.875C11.5625 6.875 12.4375 4.375 12.4375 4.375C12.4375 4.375 13.75 6.875 15.625 6.875C18.4375 6.875 24.375 6.875 24.375 6.875Z" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function CircleCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
      <path d="M22 11.5001V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.5839C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4372C2.43727 15.6284 1.87979 13.4882 2.02168 11.342C2.16356 9.19587 2.99721 7.14881 4.39828 5.55305C5.79935 3.95729 7.69279 2.89282 9.79619 2.5327C11.8996 2.17258 14.1003 2.53819 16.07 3.5701" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4.00009L12 14.0101L9 11.0101" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M22.3999 12C22.3999 17.5228 17.9227 22 12.3999 22C6.87705 22 2.3999 17.5228 2.3999 12C2.3999 6.47715 6.87705 2 12.3999 2C17.9227 2 22.3999 6.47715 22.3999 12Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.3999 6V12L16.3999 14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M12.7998 20V10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.7998 20V4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.7998 20V16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M22.3999 7L13.8999 15.5L8.8999 10.5L2.3999 17" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.3999 7H22.3999V13" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckBadgeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10M7.835 4.697C8.73294 4.28057 9.36457 3.49803 9.5 2.572C9.5 2.572 9.942 2 12 2C14.058 2 14.5 2.572 14.5 2.572C14.6354 3.49803 15.2671 4.28057 16.165 4.697C16.165 4.697 17 5.072 18 6.5C19 7.928 18.289 8.85 18.289 8.85C17.7396 9.6489 17.6218 10.6739 17.97 11.572C17.97 11.572 18.4 13 17.5 15C16.6 17 15.5 17 15.5 17C14.6331 17.0056 13.8282 17.4795 13.387 18.234C13.387 18.234 13 19 12 21C11 19 10.613 18.234 10.613 18.234C10.1718 17.4795 9.36689 17.0056 8.5 17C8.5 17 7.4 17 6.5 15C5.6 13 6.03 11.572 6.03 11.572C6.37819 10.6739 6.26038 9.6489 5.711 8.85C5.711 8.85 5 7.928 6 6.5C7 5.072 7.835 4.697 7.835 4.697Z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 11L12 14L22 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckMarkIcon() {
  return (
    <svg 
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 5H9v14h6V5z" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M24.375 6.875V15C24.375 22.97 16.5625 25.6875 12.4375 27.4375C12.1875 27.4375 11.8125 27.4375 11.5625 27.4375C7.4375 25.6875 5.625 22.97 5.625 15V6.875C5.625 6.875 7.03125 6.875 9.6875 6.875C11.5625 6.875 12.4375 4.375 12.4375 4.375C12.4375 4.375 13.75 6.875 15.625 6.875C18.4375 6.875 24.375 6.875 24.375 6.875Z" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function CircleCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
      <path d="M22 11.5001V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.5839C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4372C2.43727 15.6284 1.87979 13.4882 2.02168 11.342C2.16356 9.19587 2.99721 7.14881 4.39828 5.55305C5.79935 3.95729 7.69279 2.89282 9.79619 2.5327C11.8996 2.17258 14.1003 2.53819 16.07 3.5701" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4.00009L12 14.0101L9 11.0101" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M22.3999 12C22.3999 17.5228 17.9227 22 12.3999 22C6.87705 22 2.3999 17.5228 2.3999 12C2.3999 6.47715 6.87705 2 12.3999 2C17.9227 2 22.3999 6.47715 22.3999 12Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.3999 6V12L16.3999 14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M12.7998 20V10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.7998 20V4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.7998 20V16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M22.3999 7L13.8999 15.5L8.8999 10.5L2.3999 17" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.3999 7H22.3999V13" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckBadgeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10M7.835 4.697C8.73294 4.28057 9.36457 3.49803 9.5 2.572C9.5 2.572 9.942 2 12 2C14.058 2 14.5 2.572 14.5 2.572C14.6354 3.49803 15.2671 4.28057 16.165 4.697C16.165 4.697 17 5.072 18 6.5C19 7.928 18.289 8.85 18.289 8.85C17.7396 9.6489 17.6218 10.6739 17.97 11.572C17.97 11.572 18.4 13 17.5 15C16.6 17 15.5 17 15.5 17C14.6331 17.0056 13.8282 17.4795 13.387 18.234C13.387 18.234 13 19 12 21C11 19 10.613 18.234 10.613 18.234C10.1718 17.4795 9.36689 17.0056 8.5 17C8.5 17 7.4 17 6.5 15C5.6 13 6.03 11.572 6.03 11.572C6.37819 10.6739 6.26038 9.6489 5.711 8.85C5.711 8.85 5 7.928 6 6.5C7 5.072 7.835 4.697 7.835 4.697Z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 11L12 14L22 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

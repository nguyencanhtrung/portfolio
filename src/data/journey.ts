import type { Locale } from '../i18n/ui';

export interface Chapter {
  era: string;
  years: string;
  title: string;
  org: string;
  story: string[];
  metrics: string[];
}

export interface JourneyContent {
  heroKicker: string;
  heroName: string;
  heroTagline: string;
  heroIntro: string;
  heroRole: string;
  journeyLabel: string;
  currentLabel: string;
  chapters: Chapter[];
}

export const journey: Record<Locale, JourneyContent> = {
  en: {
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWINS · ISAC · ROBOTICS',
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to digital twins.',
    heroIntro:
      'For a decade, I engineered radio systems in silicon—developing 5G physical layers and bringing O-RAN RUs and DUs up on the bench. Today, I lead a group building the digital twins used to test those very systems, extending their application across robotics, automotive, drones, and 5G/6G. My edge lies in the intersection: simulation engineers rarely build hardware, and hardware engineers rarely build simulators.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, USA - Hanoi Office',
    journeyLabel: 'The journey',
    currentLabel: 'Programs I lead today',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations — the gate',
        org: 'HUST, Hanoi, Vietnam → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at HUST, then embedded systems at TU Kaiserslautern — graduating at the top of the German scale.',
          'FPGA accelerator for intraday financial risk: 68× over the software it replaced, near one FLOP per cycle.',
          'Two habits started here: find the bottleneck first, and prove every speedup against a reference.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — the block',
        org: 'Viettel High Tech → VinSmart, Hanoi, Vietnam',
        story: [
          '5G NR base stations from the physical layer up, on Xilinx FPGAs.',
          'Led five engineers on PUSCH and PUCCH F3; a 2T2R digital front-end meeting the 3GPP spectrum mask.',
          'PDSCH bit-processing closing timing at 300 MHz, under 150 µs end to end; an 8T8R macrocell, two RRU generations.',
          'Learned to read a specification as an executable contract.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          '8T8R macrocell · 800 Mbps',
          'ACLR 50 dB (3GPP-compliant DFE)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision — the ladder',
        org: 'Techvico (Taiwan - USA) → Avnet (Singapore)',
        story: [
          'A deliberate step up the ladder: hand-written VHDL to Vitis HLS.',
          'Three novel image-processing accelerators — disparity, defect-pixel, geometric transform — plus a streaming pipeline with the Xilinx DPU.',
          'FAE for AMD-Xilinx across Southeast Asia: a different vendor stack every few weeks, in front of customers.',
          'Learned to size unfamiliar silicon fast — and to explain it to people who don’t write RTL.',
        ],
        metrics: [
          '3 ISP accelerators in HLS',
          'AMD-Xilinx across SEA',
          'Customer-facing, multi-vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'O-RAN Systems — the box',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Joined SoC.one in 2021 — back to 5G, but as whole systems rather than blocks.',
          'FPGA acceleration for the 5G L1; O-DU and O-RU hardware platform bring-up.',
          'Fronthaul, timing domains, synchronisation — the seams where disaggregated base stations actually fail.',
          'The bench years that make an honest digital twin possible.',
        ],
        metrics: [
          '5G L1 FPGA acceleration',
          'O-DU / O-RU hardware',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Late 2024 — present',
        title: 'Digital Twins & Verticals — the world',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Run the Verticals Group — robotics, automotive, drones, 5G/6G — as manager, and tech lead where the decisions are hardest.',
          'Build the world before the product: GPU ray-traced radio channels inside network and vehicle digital twins.',
          'ISAC sensing models and a V2X sidelink stack traced clause by clause to 3GPP, ETSI and SAE.',
          'Sim-to-real and hardware/software co-design in robotics.',
        ],
        metrics: [
          'Verticals Group — 4 programs',
          'robotics · automotive · drones · 5G/6G',
          '30 engineers',
        ],
      },
    ],
  },
  vi: {
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWIN · ISAC · ROBOTICS',
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến digital twin.',
    heroIntro:
      'Trong mười năm đầu sự nghiệp, tôi tập trung vào lĩnh vực xử lý tín hiệu số trên nền tảng FPGA: từ việc tối ưu hóa (offload) lớp vật lý 5G cho đến phát triển mẫu thử nghiệm (prototype) O-RU and O-DU đầu tiên tại Việt Nam. Hiện tại, tôi đang dẫn dắt một nhóm kỹ sư phát triển các hệ thống bản sao số (digital twin) để kiểm thử những nền tảng trên — đồng thời ứng dụng chúng vào robotics, xe tự hành, drone và mạng 5G/6G. Tôi tin rằng giá trị cốt lõi nằm ở sự giao thoa này: bởi người làm mô phỏng hiếm khi có kinh nghiệm làm phần cứng thực tế, còn kỹ sư phần cứng lại ít khi tự xây dựng được hệ thống giả lập.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, USA - Hanoi Office',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những chương trình tôi đang dẫn dắt',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Nền móng',
        org: 'ĐH Bách khoa Hà Nội → TU Kaiserslautern, Đức',
        story: [
          'Tốt nghiệp Vi điện tử tại Bách khoa Hà Nội, sau đó hoàn thành chương trình Thạc sĩ Hệ thống nhúng tại TU Kaiserslautern, Đức.',
          'Phát triển FPGA accelerator cho bài toán đánh giá rủi ro tài chính trong ngày (intraday): đạt tốc độ xử lý nhanh gấp 68 lần phần mềm hiện hữu, với hiệu năng gần 1 FLOP/chu kỳ.',
          'Hình thành hai nguyên tắc làm việc cốt lõi từ dự án này: luôn tìm điểm nghẽn (bottleneck) trước, và mọi cải tiến tốc độ đều phải được đối chứng với reference model.',
        ],
        metrics: ['Tăng tốc 68× @ 100 MHz', '1.087 chu kỳ / FLOP'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio',
        org: 'Viettel High Tech → VinSmart, Hà Nội',
        story: [
          'Xây dựng trạm gốc 5G NR từ lớp vật lý (PHY layer) trên nền tảng FPGA Xilinx.',
          'Dẫn đội 5 kỹ sư làm PUSCH và PUCCH F3; khối digital front-end 2T2R đáp ứng hoàn hảo spectrum mask của 3GPP.',
          'Khối PDSCH bit-processing đóng timing (timing closure) tại 300 MHz, độ trễ dưới 150 µs; hoàn thiện macrocell 8T8R qua hai thế hệ RRU.',
          'Học được cách tiếp cận tài liệu spec như một bản hợp đồng kỹ thuật nghiêm ngặt.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          'Macrocell 8T8R · 800 Mbps',
          'ACLR 50 dB (DFE đạt chuẩn 3GPP)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision',
        org: 'Techvico (Taiwan - USA) → Avnet (Singapore)',
        story: [
          'Nâng mức trừu tượng (abstraction level) có chủ đích: chuyển dịch từ hand-written VHDL sang Vitis HLS.',
          'Phát triển 3 accelerator xử lý ảnh mới — disparity, defect-pixel, biến đổi hình học — tích hợp trong pipeline streaming cùng Xilinx DPU.',
          'Đảm nhận vai trò FAE cho AMD-Xilinx tại thị trường Đông Nam Á: liên tục làm chủ các vendor stack mới chỉ trong vài tuần để trực tiếp tư vấn cho khách hàng.',
          'Rèn luyện khả năng đánh giá nhanh một công nghệ mới — và cách giải thích hệ thống silicon cho người không chuyên RTL.',
        ],
        metrics: [
          '3 ISP accelerator bằng HLS',
          'AMD-Xilinx khắp Đông Nam Á',
          'Làm việc trực tiếp với khách hàng, đa vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'Hệ thống O-RAN',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Gia nhập SoC.one năm 2021 — trở lại mảng 5G, nhưng tập trung ở mức hệ thống thay vì từng IP block.',
          'Tăng tốc 5G L1 trên FPGA; bring-up các nền tảng phần cứng cho O-DU và O-RU.',
          'Xử lý fronthaul, timing domain và đồng bộ — những điểm kết nối nhạy cảm nơi trạm gốc disaggregated thực sự bộc lộ vấn đề.',
          'Chính những năm tháng thực chiến này đã tạo nền tảng để tôi xây dựng các mô hình Digital Twin phản ánh trung thực bản chất phần cứng.',
        ],
        metrics: [
          'Tăng tốc 5G L1 trên FPGA',
          'Bring-up phần cứng O-DU / O-RU',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Cuối 2024 — nay',
        title: 'Digital Twin & Verticals',
        org: 'SoC.one, USA - Hanoi Office',
        story: [
          'Dẫn dắt Verticals Group — robotics, automotive, drones, 5G/6G — với vai trò quản lý kiêm Tech Lead.',
          'Dựng mô phỏng trước khi dựng sản phẩm: xử lý kênh vô tuyến ray-traced trên nền tảng GPU trong Digital Twin của cả mạng và xe.',
          'Xây dựng mô hình 5G Advanced ISAC sensing và V2X sidelink stack, tuân thủ nghiêm ngặt đến từng clause của 3GPP, ETSI, SAE.',
          'Làm chủ quy trình robotics sim-to-real và giải pháp đồng thiết kế phần cứng/phần mềm (hardware/software co-design).',
        ],
        metrics: [
          'Verticals Group — 4 chương trình',
          'robotics · automotive · drones · 5G/6G',
          '30 kỹ sư',
        ],
      },
    ],
  },
};

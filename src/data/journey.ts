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
  heroName: string;
  heroTagline: string;
  heroIntro: string;
  heroRole: string;
  journeyLabel: string;
  currentLabel: string;
  independentLabel: string;
  chapters: Chapter[];
}

export const journey: Record<Locale, JourneyContent> = {
  en: {
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to digital twins.',
    heroIntro:
      'A decade building 5G FPGA radios and bringing up O‑RAN hardware on the bench; now leading digital twins and sim-to-real engineering for 5G/6G, connected driving, drones, and physical AI. Building both sides taught me how to keep simulation honest.',
    heroRole: 'Manager · SoC.one, USA',
    journeyLabel: 'The journey',
    currentLabel: 'Programs I lead today',
    independentLabel: 'Independent projects',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations — the gate',
        org: 'HUST, Hanoi, Vietnam → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at HUST, followed by an M.Sc. in embedded systems at TU Kaiserslautern, graduating at the top of the German grading scale.',
          'Designed an FPGA accelerator for intraday financial risk that ran 68× faster than the legacy software baseline at near one FLOP per cycle.',
          'Cut my teeth profiling critical paths first and validating every cycle-level gain against bit-exact software references.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — the block',
        org: 'Viettel High Tech → VinSmart, Hanoi, Vietnam',
        story: [
          'Built 5G NR physical-layer IP from scratch on Xilinx FPGAs.',
          'Led a five-engineer team delivering PUSCH, PUCCH Format 3, and a 2T2R digital front-end compliant with the 3GPP spectrum mask.',
          'Closed timing on PDSCH bit-processing at 300 MHz (< 150 µs end-to-end) and shipped an 8T8R macrocell across two RRU hardware generations.',
          'Translated dense 3GPP RAN1/RAN4 specs directly into cycle-accurate RTL.',
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
          'Moved up the abstraction stack from hand-written VHDL to Vitis HLS.',
          'Built three custom ISP accelerators—disparity, defect-pixel correction, and geometric transform—alongside a zero-copy streaming pipeline into the Xilinx DPU.',
          'Worked across Southeast Asia as an AMD-Xilinx FAE, debugging unfamiliar customer boards and toolchains on tight timelines.',
          'Got fast at sizing resource budgets on new silicon and translating RTL trade-offs for software teams and executives.',
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
          'Joined SoC.one in 2021 to work on full-box O-RAN systems rather than isolated PHY blocks.',
          'Owned 5G L1 FPGA acceleration and hardware bring-up for both O-DU and O-RU platforms.',
          'Debugged fronthaul splits, cross-clock domains, and PTP synchronization—the exact interfaces where disaggregated radios break in the lab.',
          'Spent years on the bench seeing how real RF and timing impairments behave, which later grounded our simulation models.',
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
          'Lead the Verticals Group—30 engineers across physical AI, automotive, drones, and 5G/6G—handling group management while stepping in as tech lead on core architectural calls.',
          'Architect GPU ray-traced radio channel models embedded directly inside multi-agent network and vehicle digital twins.',
          'Own ISAC sensing models and a C-V2X sidelink protocol stack verified clause-by-clause against 3GPP, ETSI, and SAE standards.',
          'Drive sim-to-real validation and hardware/software co-design for autonomous robotics platforms.',
        ],
        metrics: [
          'Verticals Group — 4 programs',
          'physical AI · automotive · drones · 5G/6G',
          '30 engineers',
        ],
      },
    ],
  },
  vi: {
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến digital twin.',
    heroIntro:
      'Mười năm thiết kế vô tuyến 5G trên FPGA và trực tiếp bring-up phần cứng O‑RAN tại phòng lab; hiện dẫn dắt mảng digital twins và sim-to-real cho 5G/6G, xe tự hành, drone và physical AI. Trải nghiệm công việc ở cả hai domain giúp tôi tạo ra môi trường mô phỏng sát với thực tế',
    heroRole: 'Manager · SoC.one, USA',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những chương trình tôi đang dẫn dắt',
    independentLabel: 'Dự án cá nhân',
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
